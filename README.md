# 操作本地 Chrome 浏览器的 localStorage

localStorage 保存在本地 leveldb 中（当前 chrome 91，貌似从 61 开始就把 sqlite3 换成了 leveldb）

Windows 路径 `~/AppData/Local/Google/Chrome/User Data/Default/Local Storage/leveldb`

经初步研究，保存的方式为

```
_${域名单字节字符串}\x00${key} => ${value}
```

其中 `key` 和 `value` 的格式为

```
1 字节 编码类型 + 字符串内容
```

编码类型：

- 0x00 - utf16-le，有多字节字符时 
- 0x01 - 不知道是 utf8 还是 ascii 还是 latin1，不存在汉字的时候就是 0x01
