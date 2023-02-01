const React = require('react');
const Button = require('./Button.react');
const {
  useEffect,
  useMemo,
  useState
} = React;
const tableStyle = {
  backgroundColor: '#faf8ef',
  width: '100%',
  borderRadius: 8
};
function Table(props) {
  const {
    columns,
    rows,
    hideColSorts,
    sortColumn
  } = props;
  const colNames = Object.keys(columns);
  const [sortByColumn, setSortByColumn] = useState(sortColumn ? {
    ...sortColumn
  } : {
    by: 'ASC',
    name: null
  });
  const headers = colNames.map(col => {
    return /*#__PURE__*/React.createElement("th", {
      key: 'header_' + col
    }, columns[col].displayName, hideColSorts || columns[col].notSortable ? null : /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 'normal'
      }
    }, "Sort:", columns[col].descOnly ? null : /*#__PURE__*/React.createElement(Button, {
      label: "/\\",
      disabled: sortByColumn.name == col,
      fontSize: 12,
      onClick: () => {
        setSortByColumn({
          by: 'ASC',
          name: col
        });
      }
    }), columns[col].ascOnly ? null : /*#__PURE__*/React.createElement(Button, {
      label: "\\/",
      disabled: sortByColumn.name == col,
      fontSize: 12,
      onClick: () => {
        setSortByColumn({
          by: 'DESC',
          name: col
        });
      }
    })));
  });
  let sortedRows = useMemo(() => {
    if (sortByColumn.name == null) return rows;
    let sorted = [];
    if (columns[sortByColumn.name].sortFn != null) {
      sorted = [...rows].sort(columns[sortByColumn.name].sortFn);
    } else {
      sorted = [...rows].sort((rowA, rowB) => {
        if (rowA[sortByColumn.name] < rowB[sortByColumn.name]) {
          return -1;
        }
        return 1;
      });
    }
    if (sortByColumn.by != 'ASC') {
      return sorted.reverse();
    }
    return sorted;
  }, [sortByColumn, rows]);
  if (props.maxRows) {
    sortedRows = sortedRows.slice(0, props.maxRows);
  }
  const rowHTML = sortedRows.map((row, i) => {
    const rowData = colNames.map(col => {
      const dataCell = columns[col].maxWidth ? ("" + row[col]).slice(0, columns[col].maxWidth) : row[col];
      return /*#__PURE__*/React.createElement("td", {
        key: 'cell_' + col + row[col],
        style: {
          textAlign: 'center'
        }
      }, dataCell);
    });
    return /*#__PURE__*/React.createElement("tr", {
      key: 'row_' + i
    }, rowData);
  });
  return /*#__PURE__*/React.createElement("table", {
    style: tableStyle
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, headers)), /*#__PURE__*/React.createElement("tbody", null, rowHTML));
}
module.exports = Table;