// Builds the SET clause of an UPDATE from a whitelist of columns.
// Column names never come from user input: only names listed in `allowedColumns`
// are used, and every value is passed as a query parameter.
const buildSetClause = (data, allowedColumns, firstIndex = 1) => {
  const assignments = [];
  const values = [];

  for (const column of allowedColumns) {
    if (data[column] === undefined) continue;
    values.push(data[column]);
    assignments.push(`${column} = $${firstIndex + values.length - 1}`);
  }

  return { clause: assignments.join(', '), values };
};

module.exports = { buildSetClause };
