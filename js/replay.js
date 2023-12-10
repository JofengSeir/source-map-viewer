function base64ToFile(base64, filename) {
    let arr = base64.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

/* 定义一个全局变量，用于控制回放 */
var replay = {
    maps: {},
    records: {},
};

(function () {
    // 载入记录
    var loadingRecord = function (record, record_key) {
        // 计算好每一帧的位置和角度，并存储在一个新的数组中
        replay.records[record_key] = record.map(function (frame) {
            return {
                x: frame[0],
                y: frame[1],
                z: frame[2] + 64, // 人物身高64单位
                yaw: (frame[4] - 90) * Math.PI / 180,
                pitch: -frame[3] * Math.PI / 180
            };
        });
        // 播放记录录像
        replay.playRecord(record_key);
    };
    replay.loadingRecord = loadingRecord;
    return loadingRecord;
})();

(function () {
    // 播放记录
    var playRecord = function (record_key) {
        const positionArray = replay.records[record_key];
        const tickFrame = 1000 / 66.66666; // 66tick
        for (let i = 0; i < positionArray.length; i++) {
            setTimeout(() => {
                viewer.mainCamera.setPosition(positionArray[i].x, positionArray[i].y, positionArray[i].z)
                viewer.setCameraAngles(positionArray[i].yaw, positionArray[i].pitch);
            }, i * tickFrame)
            console.log(i * tickFrame);
        }
    };
    replay.playRecord = playRecord;
    return playRecord;
})();

(function () {
    // 读取记录文件，可以是文件，也可以是base64文件流
    var recordReader = function (file) {
        if (typeof file === 'string'/* base64 */) file = base64ToFile(file, '地图名:关卡类型:关卡');
        const reader = new FileReader();
        reader.onload = function (event) {
            const arrayBuffer = event.target.result;
            const dataView = new DataView(arrayBuffer);
            let current_pos = 0;
            let tmp_bytes;

            const INF_MAGIC = dataView.getInt32(current_pos);
            current_pos += 4;

            const INF_RECFILE_CURVERSION = dataView.getInt32(current_pos, true);
            current_pos += 4;

            const INF_CURHEADERSIZE = dataView.getInt32(current_pos, true);
            current_pos += 4;

            const tickrate = dataView.getFloat32(current_pos, true);
            current_pos += 4;

            const time = dataView.getFloat32(current_pos, true);
            current_pos += 4;

            const runid = dataView.getInt32(current_pos, true);
            current_pos += 4;

            const mode = dataView.getInt32(current_pos, true);
            current_pos += 4;

            const style = dataView.getInt32(current_pos, true);
            current_pos += 4;

            const MAX_RECFILE_MAPNAME = 64
            const MAX_RECFILE_MAPNAME_CELL = MAX_RECFILE_MAPNAME / 4


            // 一次性读取 MAX_RECFILE_MAPNAME_CELL 个字节
            tmp_bytes = [];
            for (let i = 0; i < MAX_RECFILE_MAPNAME_CELL; i++) {
                tmp_bytes.push(dataView.getInt32(current_pos + i * 4));
            }
            current_pos += MAX_RECFILE_MAPNAME_CELL * 4;

            const MAX_RECFILE_PLYNAME = 32
            const MAX_RECFILE_PLYNAME_CELL = MAX_RECFILE_PLYNAME / 4

            // 一次性读取 MAX_RECFILE_PLYNAME_CELL 个字节
            tmp_bytes = [];
            for (let i = 0; i < MAX_RECFILE_PLYNAME_CELL; i++) {
                tmp_bytes.push(dataView.getInt32(current_pos + i * 4));
            }
            current_pos += MAX_RECFILE_PLYNAME_CELL * 4;

            const rp_length = dataView.getInt32(current_pos, true);
            current_pos += 4;

            REC_ARRAY = [];
            for (let i = 0; i < rp_length; i++) {
                let pos = [];
                let ang = [];
                let flag = [];

                pos[0] = dataView.getFloat32(current_pos, true);
                current_pos += 4;

                pos[1] = dataView.getFloat32(current_pos, true);
                current_pos += 4;

                pos[2] = dataView.getFloat32(current_pos, true);
                current_pos += 4;

                ang[0] = dataView.getFloat32(current_pos, true);
                current_pos += 4;

                ang[1] = dataView.getFloat32(current_pos, true);
                current_pos += 4;

                flag[0] = dataView.getInt32(current_pos, true);
                current_pos += 4;

                REC_ARRAY.push([...pos, ...ang, ...flag]);
            }

            replay.loadingRecord(REC_ARRAY, file.name);
        };
        reader.readAsArrayBuffer(file);
    };
    replay.recordReader = recordReader;
    return recordReader;
})();