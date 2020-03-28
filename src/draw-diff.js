const typeMarkers = {
  Edited: '+/-',
  Added: '+  ',
  Deleted: '-  ',
  None: '   ',
};

const fancyName = (name) => {
  const displayName = name.split(/(?=[A-Z])/g).join(' ');
  if (displayName.substr(-2) === 'es') return displayName.substring(0, displayName.length - 2);
  if (displayName.substr(-1) === 's') return displayName.substring(0, displayName.length - 1);
  return displayName;
}

const drawChange = (Type, Old, New) => {
  if (Type === 'Added') {
    return New != null ? `"${New}"` : '';
  } else if (Type === 'Deleted') {
    return Old != null ? `"${Old}"` : '';
  } else if (Type === 'Edited') {
    return Old != null && New != null ? `"${Old}" => "${New}"` : '';
  }
}

const drawDiff = module.exports = (diff, type = null, indent = 0) => {
  // If this is an array, draw each child.
  if (Array.isArray(diff)) return diff.map((child) => drawDiff(child, type, indent));

  const { Type: ChangeType, ID, Name, Fields, Objects, Annotations, Old, New, ...rest } = diff;
  if (ChangeType === 'None' || !ChangeType ) return null;

  const indentStr = "  ".repeat(indent);
  const marker = typeMarkers[ChangeType || 'None'];
  const nameStr = type ? `${fancyName(type)}: ${ID || Name}` : (ID || Name);
  const change = drawChange(ChangeType, Old, New);
  const hasChildren = (Objects && Objects.filter((c) => c.Type !== 'None').length)
                      || (Fields && Fields.filter((c) => c.Type !== 'None').length)
                      || Object.keys(rest).length;

  const out = [`${indentStr}${marker} ${nameStr} ${change} ${hasChildren ? ' {' : ''}`];

  // Show field updates
  Objects && Objects.forEach((field) => out.push(drawDiff(field, null, indent+1)));
  Fields && Fields.forEach((field) => out.push(drawDiff(field, null, indent+1)));

  // Show updates for children
  Object.keys(rest)
    .map((k) => ({ k, v: rest[k] }))
    .forEach((kv) => out.push(drawDiff(kv.v, kv.k, indent+1)));

  if (hasChildren) out.push(`${indentStr}}`);
  return out.filter((e) => e).join("\n");
}
