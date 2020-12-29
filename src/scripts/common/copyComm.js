/*
    点击按钮复制到剪贴板
    destDom: 对应DOM
    copyStr: 复制文本
    succallback: 复制成功回调
    failcallback: 复制失败回调
*/
copyComm = function(destDom, copyStr, succallback, failcallback) {
    if(document.queryCommandSupported('paste')) {
        console.log('支持JS粘贴')
    } else {
        console.log('不支持JS粘贴')
    }
    var div = document.createElement("div")
    div.innerHTML = '<input id="androidContent" readOnly="true" style="user-select: auto;-webkit-user-select: auto;-ms-user-select: auto;outline: none;border: 0px;color: rgba(0,0,0,0.0);position: absolute;top:-9999px;left:-9999px;background-color: transparent;" value="' + copyStr + '"/><div id="iosContent" style="user-select: auto;-webkit-user-select: auto;-ms-user-select: auto;position: absolute;top:-9999px;left:-9999px;color: rgba(0,0,0,0);background-color: transparent">' + copyStr + '</div>'
    document.body.appendChild(div)

    destDom.addEventListener('click', function(e) {
        if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) {//区分iPhone设备
            window.getSelection().removeAllRanges();//这段代码必须放在前面否则无效
            var Url2=document.getElementById("iosContent");//要复制文字的节点
            var range = document.createRange();
            // 选中需要复制的节点
            range.selectNode(Url2);
            // 执行选中元素
            window.getSelection().addRange(range);
            // 执行 copy 操作
            // var successful = document.execCommand('copy');
            try{
                if(document.execCommand('copy')){
                    succallback();
                } else{
                    failcallback();
                }
            } catch(err){
                failcallback();
            }
            // 移除选中的元素
            window.getSelection().removeAllRanges();
        } else {
            var Url2=document.getElementById("androidContent");//要复制文字的节点
            Url2.select(); // 选择对象
            try{
                if(document.execCommand('copy')){
                    succallback();
                } else{
                    failcallback();
                }
            } catch(err){
                failcallback();
            }
        }
    });
}