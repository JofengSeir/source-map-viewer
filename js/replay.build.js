// 在js文件中，定义一个函数，用于创建和添加元素，并绑定事件监听器
function createAndBindElements() {
    // 创建一个input元素，设置它的属性
    const input = document.createElement("input");
    input.type = "file";
    input.id = "record-file-input";
    input.accept = ".rec";
    input.style.display = "none";
    // 创建一个button元素，设置它的属性和文本内容
    const button = document.createElement("button");
    button.id = "load-record-btn";
    button.textContent = "加载记录";
    button.style.position = "absolute";
    button.style.zIndex = 9999;

    // 获取要添加元素的父元素，比如id为record-div的div元素
    const parent = document.getElementById("map-view");
    // 把input和button元素添加到父元素中
    parent.appendChild(input);
    parent.appendChild(button);

    // 给input和button元素添加事件监听器
    button.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) replay.recordReader(file);
        e.target.value = '';
    });
}

window.addEventListener('load', function () {
    createAndBindElements();
});