/*
    Adapted from https://github.com/mleibman/SlickGrid/blob/master/plugins/slick.checkboxselectcolumn.js to support
    Backbone attributes via get/set('attr').

 */

(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "Custom": {
                "CheckboxSelectAllColumn": CheckboxSelectAllColumn
            }
        }
    });


    function CheckboxSelectAllColumn(options) {
        var _grid;
        var _self = this;
        var _handler = new Slick.EventHandler();
        var _defaults = {
            columnId: "_checkbox_selector",
            cssClass: null,
            toolTip: "Select/Deselect All",
            width: 30,
            resizable: true,
            sortable: false
        };
        var _selectAll = false;

        var _options = $.extend(true, {}, _defaults, options);

        function init(grid) {
            _grid = grid;
            _handler
                .subscribe(_grid.onClick, handleClick)
                .subscribe(_grid.onHeaderClick, handleHeaderClick)
                .subscribe(_grid.onKeyDown, handleKeyDown);
        }

        function destroy() {
            _handler.unsubscribeAll();
        }

        function handleKeyDown(e, args) {
            if (e.which == 32) {
                if (_grid.getColumns()[args.cell].id === _options.columnId) {
                    // if editing, try to commit
                    if (!_grid.getEditorLock().isActive() || _grid.getEditorLock().commitCurrentEdit()) {
                        toggleRowSelection(args.row);
                        _grid.invalidateRow(args.row);
                        _grid.render();
                    }
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }
        }

        function handleClick(e, args) {
            // clicking on a row select checkbox
            if (_grid.getColumns()[args.cell].id === _options.columnId && $(e.target).is(":checkbox")) {
                // if editing, try to commit
                if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                var checked = $(e.target).is(":checked");
                toggleRowSelection(args.row, checked);
                _grid.invalidateRow(args.row);
                _grid.render();

                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }

        function toggleRowSelection(row, selected) {
            var cell = _grid.getDataItem(row);
            if (typeof selected === 'undefined') {
                selected = !cell.get(_options.field);
            }
            cell.set(_options.field, selected);
        }

        function handleHeaderClick(e, args) {
            if (args.column.id == _options.columnId && $(e.target).is(":checkbox")) {
                // TODO: change the value of every row
                // if editing, try to commit
                if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                _selectAll = !_selectAll;
                var checked = $(e.target).is(":checked");
                for (var i = 0; i < _grid.getDataLength(); i++) {
                    toggleRowSelection(i, checked);
                    _grid.invalidateRow(i);
                }
                _grid.render();

                // just pop the selected event
//                _grid.setSelectedRows(_grid.getSelectedRows());
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }


        function getColumnHeader(checked) {
            var header = _options.name;
            if (_options.enableCheckAll) {
                if (checked) {
                    header += " <input type='checkbox' checked='checked'>";
                }
                else {
                    header += " <input type='checkbox'>";
                }
            }
            return header;
        }

        function getColumnDefinition() {
            return {
                id: _options.columnId,
                name: getColumnHeader(),
                toolTip: _options.toolTip,
                field: _options.field,
                width: _options.width,
                resizable: _options.resizable,
                sortable: _options.sortable,
                cssClass: _options.cssClass,
                editor: _options.editor,
                formatter: checkboxSelectionFormatter
            };
        }

        function checkboxSelectionFormatter(row, cell, value, columnDef, dataContext) {
            if (dataContext) {
                // TODO: also consider the cells value
                return value
                    ? "<input type='checkbox' checked='checked'>"
                    : "<input type='checkbox'>";
            }
            return null;
        }

        $.extend(this, {
            "init": init,
            "destroy": destroy,

            "getColumnDefinition": getColumnDefinition
        });
    }
})(jQuery);
