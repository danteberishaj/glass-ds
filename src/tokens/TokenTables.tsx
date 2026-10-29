/* Storybook docs only (imported by Tokens.mdx). Renders the token objects so the reference can't go stale. */
import { primitive, semantic } from './tokens';

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

function flatten(obj: object, path: string[] = []): [string, string][] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? flatten(value as object, [...path, kebab(key)])
      : [[`--gds-${[...path, kebab(key)].join('-')}`, String(value)] as [string, string]],
  );
}

const isColor = (name: string, value: string) => name.startsWith('--gds-color-') || /^rgb\(/.test(value);
const swatch = (name: string, value: string) =>
  name.startsWith('--gds-color-') ? `rgb(${value})` : /^rgb\(/.test(value) ? value : undefined;

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Token</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, value]) => (
          <tr key={name}>
            <td>
              <code>{name}</code>
            </td>
            <td style={{ fontFamily: 'var(--gds-font-family-mono)', fontSize: 12 }}>
              {isColor(name, value) && (
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    marginRight: 8,
                    verticalAlign: '-2px',
                    borderRadius: 4,
                    border: '1px solid var(--gds-border-subtle)',
                    background: swatch(name, value),
                  }}
                />
              )}
              {value.length > 80 ? `${value.slice(0, 80)}…` : value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TokenTables() {
  const groups = Object.entries(primitive).map(([group, values]) => [group, flatten(values as object, [kebab(group)])] as const);
  const light = Object.entries(semantic.light).map(([k, v]) => [`--gds-${k}`, v] as [string, string]);
  const dark = Object.entries(semantic.dark).map(([k, v]) => [`--gds-${k}`, v] as [string, string]);
  return (
    <>
      <h3>Semantic (light)</h3>
      <Table rows={light} />
      <h3>Semantic (dark)</h3>
      <Table rows={dark} />
      {groups.map(([group, rows]) => (
        <div key={group}>
          <h3>Primitive: {group}</h3>
          <Table rows={rows} />
        </div>
      ))}
    </>
  );
}
