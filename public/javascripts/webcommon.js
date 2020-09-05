/**
 * Created by Administrator on 2019/4/10.
 */
function poper(str) {
    var ele = document.createElement("span")
    ele.classList.add("poper")
    ele.innerText = str
    document.getElementsByTagName("body")[0].appendChild(ele)
    setTimeout(function () {
        document.getElementsByTagName("body")[0].removeChild(ele)
    }, 1000)
}

function randomString(len) {
    len = len || 10;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = $chars.length;
    var str = '';
    for (i = 0; i < len; i++) {
        str += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return str;
}

function h5Copy(content) {
    let textarea = document.createElement("textarea");
    textarea.value = content;
    textarea.readOnly = "readOnly";
    document.body.appendChild(textarea);
    textarea.select(); // 选择对象
    textarea.setSelectionRange(0, content.length); //核心
    let result = document.execCommand("Copy"); // 执行浏览器复制命令
    textarea.remove();
    return result;
}

var limitNum = 2;