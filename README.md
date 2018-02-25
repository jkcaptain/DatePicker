# DatePicker
javascript picker时间选择器

工作中有一个时间选择的需求，类似demo中的自定义picker —— DatePicker.html。

大致流程

1.创建好html

2.touchstart时，记录坐标。

3.touchmove时，计算手指移动的距离，改变元素的transform或left

4.touchend时，用户可能会滑动到某列的中间位置，注意需要调整picker的位置。我这里用的是四舍五入Math.round。

难点：

1.根据元素style的transform属性，写正则匹配出我们需要的translate数值。

2.touchend时，假如用户快速滑动，需要有一个公式去计算出此时元素应该滚动多大的距离。我是参考的mint-ui。

用法：

    var picker = window.DatePicker(elem || id, {
        year: '2013-2020',   //String, 表示年份的区间，默认区间为2011-2028
        startDate: '2018-01-01',  //String, 表示初始化时的时间，默认值为当前日
        separator： '-',    //String, 表示年月日之间的分隔符，默认值为'-'
        needSuffix: false,  //Boolean, 是否需要在数字后面加上 年、月、日，默认值为false
        selectCallback: undefined   //Function, 每次选择时间后触发的回调函数，默认值为undefined
    });

提供了2个方法：

    picker.getSelectedTime()    //获取当前选中的时间    
    
    picker.translateTo('2018-01-30');    //根据传入的值，picker自动滑动至这个时间

我比较喜欢单纯，所以只实现picker的基本功能，其他比如确定或取消按钮，picker的出入动画，没有在插件里实现。

DatePicker.html是我自定义的picker， 实现了出入动画和确定按钮。具体代码可查看demo页面。

缺点：

1.不是面向对象

2.没有自定义的事件系统，有的话就不用回调函数了

3.性能尚未优化

兼容性：只处理移动端, 兼容webkit内核。

希望能给大家带来帮助。如有错误之处，还望指出。

参考资料

https://github.com/ElemeFE/mint-ui/blob/master/packages/picker/src/translate.js

https://github.com/ElemeFE/mint-ui/blob/master/packages/picker/src/
