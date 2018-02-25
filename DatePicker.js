(function() {
    /*工具类 ------ start*/
    var TRANSFORM_KEY = checkPrefix("transform");
    //DOM属性补充前缀
    function checkPrefix(style) {
        var prefix = ["webkit", "moz", "ms", "O"];

        var elementStyle = document.documentElement.style;

        if (elementStyle[style] !== undefined) {
            return style;
        }
        var checkStyle = "";
        for (var i = 0, len = prefix.length; i < len; i++) {
            checkStyle = prefix[i] + firstToUpper(style);
            if (elementStyle[checkStyle] !== undefined) {
                break;
            }
        }
        return checkStyle;
    }
    //首字母转大写
    function firstToUpper(str) {
        return str.replace(/\b(\w)|\s(\w)/, function(match) {
            return match.toUpperCase();
        });
    }
    //个位数前面填充0
    function numFormat(num) {
        return num < 10 ? "0" + num : num;
    }
    //创建dom节点
    function createNode(tag, className, text) {
        var tagNode = document.createElement(tag);
        !!className && tagNode.classList.add(className);
        !!text && tagNode.appendChild(document.createTextNode(text));
        return tagNode;
    }
    //给节点添加data属性
    function setData(node, camelCasedName, data) {
        node.dataset[camelCasedName] = data;
        return node;
    }
    //获取节点的data属性
    function getData(node, camelCasedName) {
        return node.dataset[camelCasedName];
    }
    //获取translate属性值
    function getTranslate(elem) {
        var result = { top: 0, left: 0 };

        if (elem === null || elem.style === null) return result;

        var transform = elem.style[TRANSFORM_KEY];
        var matches = /translate\(\s*(-?\d+(\.?\d+?)?)px,\s*(-?\d+(\.\d+)?)px\)\s*translateZ\(0px\)/gi.exec(
            transform
        );

        if (matches) {
            result.left = +matches[1];
            result.top = +matches[3];
        }

        return result;
    }
    //设置translate属性值
    function translateElem(elem, x, y) {
        if (x === null && y === null) return;

        if (!elem || elem.style === null) return;

        if (!elem.style[TRANSFORM_KEY] && x === 0 && y === 0) return;

        if (x === null || y === null) {
            var translate = getTranslate(elem);
            x === null && (x = translate.left);
            y === null && (y = translate.top);
        }

        cancelTranslateElem(elem);
        elem.style[TRANSFORM_KEY] =
            "translate(" + x + "px," + y + "px) translateZ(0px)";
    }
    //清空translate属性值
    function cancelTranslateElem(elem) {
        if (elem === null || elem.style === null) return;

        var transformValue = elem.style[TRANSFORM_KEY];
        if (transformValue) {
            transformValue = transformValue.replace(
                /translate\(\s*(-?\d+(\.?\d+?)?)px,\s*(-?\d+(\.\d+)?)px\)\s*translateZ\(0px\)/g,
                ""
            );
            elem.style[TRANSFORM_KEY] = transformValue;
        }
    }
    /*工具类 ------ end*/

    /*
	 * @ DatePicker函数
	 * @ Params{container} 代表容器
	 * @ Params{year} 年份区间
	 * @ Params{startDate} 开始的时间
	 * @ Params{separator} 年月日之间的分隔符
	 * @ Params{needSuffix} 是否需要在数字后面加上 年,月,日
	 * @ Params{selectCallback} 每次选择后触发的回调函数, 外部传入
	*/
    function DatePicker(container, options) {
        container =
            container instanceof HTMLElement
                ? container
                : document.querySelector(container);
        if (!container) {
            console.warn("必须要有一个容器置放picker");
            return;
        }
        container.innerHTML = "";
        if (container.nextElementSibling !== null) {
            container.parentNode.removeChild(container.nextElementSibling);
        }

        var START_YEAR = 2011,
            END_YEAR = 2028,
            MONTH_NUM = 12;

        options = options || {};
        var separator = options.separator || "-";
        //传入的年
        var inpYearArr = options.year && options.year.split(separator);
        if (!!inpYearArr) {
            START_YEAR = parseInt(inpYearArr[0]);
            END_YEAR = parseInt(inpYearArr[1]);
        }
        //传入的时间
        var startDate = (function() {
            if (options.startDate) {
                return options.startDate.split(separator);
            }
            var now = new Date(),
                year = now.getFullYear().toString();
            month = numFormat(now.getMonth() + 1).toString();
            day = numFormat(now.getDate()).toString();
            return [year, month, day];
        })();
        var selectedTime = startDate.join(separator);

        //是否需要 年月日 后缀, 默认为false
        var needSuffix = !!options.needSuffix;

        //每次选择后触发的函数
        var selectCallback = options.selectCallback;

        /*html创建 ------ start*/
        //创建year的html
        function _createYear(startYear, endYear) {
            if (startYear > endYear) {
                console.warn("开始年份必须小于结束年份");
            }
            var len = endYear - startYear + 1;
            var yearList = createNode("ul", "picker-list");
            var suffix = needSuffix ? "年" : "";
            var node = null;
            var current = 0;
            for (var i = 0; i < len; i++) {
                current = startYear + i;
                node = createNode("li", "", current + suffix);
                node = setData(node, "value", current);
                yearList.appendChild(node);
            }
            return yearList;
        }
        //创建month的html
        function _createMonth(monthNum) {
            var monthList = createNode("ul", "picker-list");
            var suffix = needSuffix ? "月" : "";
            var node = null;
            var current = 0;
            for (var i = 1; i <= monthNum; i++) {
                current = numFormat(i);
                node = createNode("li", "", current + suffix);
                node = setData(node, "value", current);
                monthList.appendChild(node);
            }
            return monthList;
        }
        //创建days的html
        function _createDays(year, month) {
            var daysList = createNode("ul", "picker-list");
            //获取当前月，总共有多少天
            var daysLen = new Date(
                parseInt(year),
                parseInt(month),
                0
            ).getDate();
            var suffix = needSuffix ? "日" : "";
            var node = null;
            var current = 0;
            for (var i = 1; i <= daysLen; i++) {
                current = numFormat(i);
                node = createNode("li", "", current + suffix);
                node = setData(node, "value", current);
                daysList.appendChild(node);
            }
            return daysList;
        }
        //创建容器中间的那两根辅助线
        function _createPickerCener() {
            var pickerCenter = createNode("div", "picker-center");
            return pickerCenter;
        }
        //每次选择月份后，重新填充days
        function _insertNewDays(elem, year, month) {
            year = parseInt(year);
            month = parseInt(month);
            var newDaysListItems = _createDays(year, month).children;
            var fragment = document.createDocumentFragment();

            //如果天数一样，就不重新渲染了
            if (newDaysListItems.length === elem.children.length) return;

            //清空daysList
            var range = document.createRange();
            range.selectNodeContents(elem);
            range.deleteContents();
            range.detach();
            range = null;

            //填充新数据
            [].forEach.call(newDaysListItems, function(item, index) {
                fragment.appendChild(item.cloneNode(true));
            });
            elem.appendChild(fragment);
        }
        //创建html布局
        function _createLayout() {
            var yearList = _createYear(START_YEAR, END_YEAR);
            var monthList = _createMonth(MONTH_NUM);
            var daysList = _createDays(startDate[0], startDate[1]);
            var pickerCenter = _createPickerCener();
            container.appendChild(yearList);
            container.appendChild(monthList);
            container.appendChild(daysList);
            container.parentNode.appendChild(pickerCenter);
        }
        _createLayout();
        /*html创建 ------ end*/

        /*计算函数 ------ start*/
        var containerChild = container.children;
        //一列的高度
        var itemHeight = containerChild[0].children[0].offsetHeight;
        //容器能放几个item
        var viewLength = Math.floor(
            container.parentNode.offsetHeight / itemHeight
        );
        var yearListHeight = _getContentHeight(
            itemHeight,
            containerChild[0].children.length
        );
        var monthListHeight = _getContentHeight(
            itemHeight,
            containerChild[1].children.length
        );
        var daysListHeight = _getContentHeight(
            itemHeight,
            containerChild[2].children.length
        );
        //获取list的高度
        function _getContentHeight(itemHeight, length) {
            return itemHeight * length;
        }
        //获取当前item的index
        function _getIndex(elem, parent) {
            return [].indexOf.call(parent.children, elem);
        }
        //拖动的范围
        function _getDragRange(elem) {
            var min = 0;
            if (elem && elem instanceof HTMLElement) {
                min =
                    -itemHeight *
                    (elem.children.length - Math.ceil(viewLength / 2));
            }
            return {
                min: min,
                max: itemHeight * Math.floor(viewLength / 2)
            };
        }
        //根据translate获取当前选中的value值和index索引
        function _getValueByTran(elem, translate) {
            var startTop = _getDragRange().max;
            var index = Math.abs(translate - startTop) / itemHeight;
            var curItem = elem.children[index];
            return {
                index: index,
                value: curItem.dataset.value
            };
        }
        //根据value获取index索引, 然后可以根据index计算translate值
        function _getTransByValue(elem, value) {
            var curIndex = 0;
            var i = 0,
                list = elem.children,
                len = list.length;
            for (; i < len; i++) {
                if (list[i].dataset.value === value) {
                    curIndex = i;
                    break;
                }
            }
            return _getDragRange().max - curIndex * itemHeight;
        }
        /*计算函数 ------ end*/

        /*监听滑动事件 ------ start*/
        var start = {},
            delta = {},
            velocityTranslate = 0,
            prevTranslate = 0,
            selectedDate = startDate,
            selectedIndexArr = []; //选中的li在ul中的索引

        var _dragEvents = {
            handleEvent: function(e) {
                switch (event.type) {
                    case "touchstart":
                        this.start(e);
                        break;
                    case "touchmove":
                        this.move(e);
                        break;
                    case "touchend":
                        this.end(e);
                        break;
                    default:
                        break;
                }
            },
            start: function(e) {
                var touches = e.touches[0],
                    elem = e.currentTarget,
                    //当前的tranlsate值
                    hasMove = getTranslate(elem).top;

                start = {
                    y: touches.pageY,
                    hasMove: hasMove,
                    startTime: new Date(),
                    selectedIndex: _getValueByTran(elem, hasMove).index
                };
                elem.addEventListener("touchmove", _dragEvents, false);
                elem.addEventListener("touchend", _dragEvents, false);
            },
            move: function(e) {
                var touches = e.touches[0],
                    elem = e.currentTarget;

                if (!elem.classList.contains("isdragging")) {
                    elem.classList.add("isdragging");
                }

                delta = {
                    y: touches.pageY - start.y + start.hasMove
                };

                velocityTranslate = delta.y - prevTranslate || delta.y;
                prevTranslate = delta.y;

                translateElem(elem, 0, delta.y);
            },
            end: function(e) {
                var elem = e.currentTarget;
                var momentumRatio = 7;
                var currentTranslate = delta.y;
                var duration = new Date() - start.startTime;

                elem.classList.remove("isdragging");

                var momentumTranslate;
                //快速滑动
                if (duration < 300) {
                    momentumTranslate =
                        currentTranslate + velocityTranslate * momentumRatio;
                }

                var translate;
                var dranRange = _getDragRange(elem);
                if (momentumTranslate) {
                    translate =
                        Math.round(momentumTranslate / itemHeight) * itemHeight;
                } else {
                    translate =
                        Math.round(currentTranslate / itemHeight) * itemHeight;
                }
                translate = Math.max(
                    Math.min(translate, dranRange.max),
                    dranRange.min
                );
                translateElem(elem, 0, translate);

                //更新selectedDate数组
                var curIndex = _getIndex(elem, container);
                var curItemState = _getValueByTran(elem, translate);
                selectedDate[curIndex] = curItemState.value;

                //添加class
                elem.children[start.selectedIndex].classList.remove("selected");
                elem.children[curItemState.index].classList.add("selected");
                selectedIndexArr[curIndex] = curItemState.index;

                //如果滑动的是年份或月份, 就更新天数
                //curIndex === 0代表变化的是年份， curIndex === 1代表变化的是月份
                if (curIndex === 0 || curIndex === 1) {
                    var daysListElement;
                    if (curIndex === 0) {
                        daysListElement =
                            elem.nextElementSibling.nextElementSibling;
                    } else {
                        daysListElement = elem.nextElementSibling;
                    }
                    _insertNewDays(
                        daysListElement,
                        selectedDate[0],
                        selectedDate[1]
                    );
                    //调整daysList的translate, 并更新selectedDate
                    var curDayListTop = getTranslate(daysListElement).top;
                    var minDayListTop = _getDragRange(daysListElement).min;
                    //不能小于最小值
                    curDayListTop = Math.max(curDayListTop, minDayListTop);
                    translateElem(daysListElement, 0, curDayListTop);

                    var newDaysListState = _getValueByTran(
                        daysListElement,
                        curDayListTop
                    );
                    selectedDate[2] = newDaysListState.value;
                    daysListElement.children[
                        newDaysListState.index
                    ].classList.add("selected");
                }

                //更新selectedTime
                selectedTime = selectedDate.join(separator);

                //触发回调
                typeof selectCallback === "function" &&
                    selectCallback.call(null);

                elem.removeEventListener("touchmove", _dragEvents, false);
                elem.removeEventListener("touchend", _dragEvents, false);
            },
            init: function(elem) {
                elem.addEventListener("touchstart", _dragEvents, false);
            }
        };
        /*监听事件 ------ end*/

        /*初始化*/
        function init() {
            [].forEach.call(container.children, function(item, index) {
                var startTop = _getTransByValue(item, startDate[index]);
                item.classList.add("isdragging");
                translateElem(item, 0, startTop);

                var state = _getValueByTran(item, startTop);
                selectedIndexArr[index] = state.index;
                item.children[state.index].classList.add("selected");

                _dragEvents.init(item);
            });
        }
        init();

        /*暴露出去的方法 ------ start*/
        //获取当前选中的时间
        function getSelectedTime() {
            return selectedTime;
        }
        //自动滑动至传入的date值
        //比如传入的date为 2017-08-08，则picker自动滚动到2017-08-08
        function translateTo(value) {
            if (!value) return;
            if (value === selectedTime) return;
            var valueToArr = value.split(separator);
            if (valueToArr.length !== 3) return;

            valueToArr.forEach(function(value, index) {
                var elem = container.children[index];
                var startTop = _getTransByValue(elem, value);
                translateElem(elem, 0, startTop);

                elem.children[selectedIndexArr[index]].classList.remove(
                    "selected"
                );
                var state = _getValueByTran(elem, startTop);
                selectedIndexArr[index] = state.index;
                elem.children[state.index].classList.add("selected");
            });

            selectedTime = value;
            selectedDate = valueToArr;
        }
        /*暴露出去的方法 ------ end*/

        return {
            getSelectedTime: function() {
                return getSelectedTime();
            },
            translateTo: function(value) {
                return translateTo(value);
            }
        };
    }

    window.DatePicker = DatePicker;
})();
