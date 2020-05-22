/*
      Author: Blake McBride
      Date:  4/22/18
 */

/* global Utils, DateUtils */

'use strict';


(function () {

    const processor = function (elm, attr, content) {
        let originalValue;
        let nstyle;
        let min = null;
        let max = null;
        let required = false;
        if (attr.style)
            nstyle = attr.style;
        else
            nstyle = '';
        let enterFunction = null;
        let nattrs = '';
        let id;
        for (let prop in attr) {
            switch (prop) {

                // new attributes

                case 'min':
                    min = Number(Utils.removeQuotes(attr[prop]).replace(/-/g, ""));
                    break;
                case 'max':
                    max = Number(Utils.removeQuotes(attr[prop]).replace(/-/g, ""));
                    break;
                case 'required':
                    required = true;
                    break;

                // pre-existing attributes

                case 'style':
                    break;  // already dealing with this
                case 'id':
                    id = Utils.removeQuotes(attr[prop]);
                    break;
                default:
                    nattrs += ' ' + prop + '="' + attr[prop] + '"';
                    break;
            }
        }

        const newElm = Utils.replaceHTML(id, elm, '<input type="date" style="{style}" {attr} placeholder="{placeholder}" id="{id}">', {
            style: nstyle,
            attr: nattrs,
            placeholder: content ? content.trim() : ''
        });
        const jqObj = newElm.jqObj;

        jqObj.on('change', function () {
            Utils.someControlValueChanged();
        });

        function keyUpHandler(event) {
            if (enterFunction && event.keyCode === 13) {
                event.stopPropagation();
                enterFunction();
            }
        }

        jqObj.keyup(keyUpHandler);

        //--

        newElm.getIntValue = function () {
            return DateUtils.SQLtoInt(jqObj.val());
        };

        newElm.getSQLValue = function () {
            return jqObj.val();
        };

        newElm.getDateValue = function () {
            return DateUtils.intToDate(DateUtils.SQLtoInt(jqObj.val()));
        };

        newElm.setValue = function (val) {
            if (!val)
                jqObj.val('');
            else if (typeof val === 'number')
                jqObj.val(DateUtils.intToSQL(val));
            else if (typeof val === 'string') {
                if (/^\d+$/.test(val))
                    jqObj.val(DateUtils.intToSQL(Number(val)));
                else
                    jqObj.val(val);
            } else if (typeof val === 'object')  // Date
                jqObj.val(DateUtils.intToSQL(DateUtils.dateToInt(val)));
            originalValue = newElm.getIntValue();
            return this;
        };

        newElm.isDirty = function () {
            return originalValue !== newElm.getIntValue();
        };

        newElm.clear = function () {
            jqObj.val('');
            originalValue = newElm.getIntValue();
            return this;
        };

        newElm.readOnly = function () {
            jqObj.attr('readonly', true);
            return this;
        };

        newElm.readWrite = function () {
            jqObj.attr('readonly', false);
            return this;
        };

        newElm.isReadOnly = function () {
            return !!jqObj.attr('readonly');
        };

        newElm.disable = function () {
            jqObj.prop('disabled', true);
            return this;
        };

        newElm.enable = function () {
            jqObj.prop('disabled', false);
            return this;
        };

        newElm.isDisabled = function () {
            return !!jqObj.attr('disabled');
        };

        newElm.hide = function () {
            jqObj.hide();
            return this;
        };

        newElm.show = function () {
            jqObj.show();
            return this;
        };

        newElm.isHidden = function () {
            return jqObj.is(':hidden');
        };

        newElm.isVisible = function () {
            return jqObj.is(':visible');
        };

        newElm.focus = function () {
            jqObj.focus();
            return this;
        };

        newElm.onChange = function (func) {
            jqObj.off('change').on('change', function () {
                Utils.someControlValueChanged();
                func(jqObj.val());
            });
            return this;
        };

        newElm.onEnter = function (fun) {
            enterFunction = fun;
            return this;
        }

        newElm.isError = function (desc) {
            let val = newElm.getIntValue();
            if (required  &&  !val) {
                Utils.showMessage('Error', desc + ' is required.').then(function () {
                    jqObj.focus();
                });
                return true;
            }
            if (val  &&  (min !== null  &&  val < min  ||  max !== null  &&  val > max)) {
                let msg;
                if ((min  ||  min === 0)  &&  (max  ||  max === 0))
                    msg = desc + ' must be between ' + DateUtils.intToStr4(min) + ' and ' + DateUtils.intToStr4(max) + '.';
                else if (min  &&  min !== 0)
                    msg = desc + ' must be greater than or equal to ' + DateUtils.intToStr4(min) + '.';
                else
                    msg = desc + ' must be less than or equal to ' + DateUtils.intToStr4(max) + '.';
                Utils.showMessage('Error', msg).then(function () {
                    jqObj.focus();
                });
                return true;
            }
            return false;
        };
    };

    const componentInfo = {
        name: 'DateInput',
        tag: 'date-input',
        processor: processor
    };
    Utils.newComponent(componentInfo);

})();


