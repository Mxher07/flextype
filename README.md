# FlexType

一个 JavaScript 运行时类型推断与自动转换库。将字符串形式的数字、布尔值、JSON 等自动转换为对应的 JavaScript 类型，可作为通用变量类型使用。

## 特性

- **自动类型转换**：`"123"` → `123`，`"true"` → `true`，`'{"x":1}'` → `{x:1}`，`"[1,2]"` → `[1,2]`
- **类型锁定机制**：`strLock()` / `boolLock()` / `typeLock()` 防止不必要的转换
- **数学运算**：`add` / `subtract` / `multiply` / `divide`，自动处理类型安全
- **数组/对象操作**：`get()` / `set()` / `push()` 链式访问嵌套数据
- **批量声明**：`declareFlex()` 一次处理多组变量
- **跨平台**：ESM / CJS / UMD，支持 Node.js 和浏览器
- **零依赖**：核心源码约 110 行，构建后 ~4.5KB

## 安装

```bash
npm install flextypeonjs
```

CDN：

```html
<script src="https://cdn.jsdelivr.net/gh/Mxher07/flextype@main/dist/flextype.umd.js"></script>
<script>
const { FlexType, flex, declareFlex } = FlexTypeRuntime;
</script>
```

## 快速开始

```javascript
import { flex } from 'flextypeonjs';

const age = flex('age', '25');
console.log(age.value); // 25
console.log(age.type);  // "number"

const active = flex('active', 'true');
console.log(active.value); // true
console.log(active.type);  // "boolean"

const data = flex('data', '{"items": [1, 2, 3]}');
console.log(data.value);    // { items: [1, 2, 3] }
console.log(data.type);     // "object"
```

## API

### flex(name, value, options?)

创建单个 FlexType 实例。

```javascript
flex('port', '3000');
flex('debug', 'true', { boolLock: true });
```

### declareFlex(variables, options?)

批量创建。

```javascript
const cfg = declareFlex({
  port: '3000',
  debug: 'true',
  db: '{"host":"localhost"}'
});
// cfg.port.value -> 3000
// cfg.debug.value -> true
```

### FlexType 实例

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `.value` | any | 转换后的值 |
| `.type` | string | 推断类型 (`number`, `string`, `boolean`, `array`, `object`, `null`, `undefined`, `nan`) |
| `.name` | string | 变量名 |
| `.isLocked` | boolean | 是否存在锁定 |

#### 类型检查

`.isString()` `.isNumber()` `.isBoolean()` `.isArray()` `.isObject()` `.isNull()` `.isUndefined()`

#### 锁定

```javascript
flex('id', '123').strLock();      // 保持字符串 "123"
flex('flag', true).boolLock();    // true 参与运算时视为 1，结果限制在 [0,1]
flex('val', 'hello').typeLock();  // 不做任何类型转换
.unlock()                         // 解除所有锁定
```

#### 数学运算

```javascript
flex('a', '10').add(5).value;       // 15
flex('a', '10').subtract(3).value;  // 7
flex('a', '10').multiply(2).value;  // 20
flex('a', '10').divide(5).value;    // 2
```

#### 数组 / 对象

```javascript
flex('arr', [1,2,3]).get(1).value;   // 2
const arr = flex('arr', [1]);
arr.push(2, 3);                       // [1, 2, 3]

flex('obj', {x:1}).get('x').value;   // 1
const obj = flex('obj', {x:1});
obj.set('y', 2);                      // {x:1, y:2}
```

#### 显式类型转换

```javascript
flex('a', 42).toString().value;     // "42"
flex('a', '42').toNumber().value;   // 42
flex('a', 0).toBoolean().value;     // false
```

#### 调试

```javascript
flex('x', '123').debug();
// { name: 'x', value: 123, type: 'number', raw: '123', options: {}, isLocked: false }
```

## 使用场景

### 配置文件 / 环境变量

```javascript
import { declareFlex } from 'flextypeonjs';

const config = declareFlex({
  port: process.env.PORT || '3000',
  debug: process.env.DEBUG || 'false',
  features: process.env.FEATURES || '["auth", "api"]'
});
// config.port.value  -> 3000 (number)
// config.debug.value -> false (boolean)
```

### 表单数据处理

```javascript
const form = declareFlex({
  age: '25',
  newsletter: 'true'
});
// form.age.value        -> 25 (number)
// form.newsletter.value -> true (boolean)
```

### 布尔值数学运算

```javascript
const active = flex('active', true).boolLock();
const result = active.subtract(1).toBoolean();
console.log(result.value); // false
```

## 许可证

MIT License
