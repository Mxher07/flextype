# FlexType

[English](./README_EN.md) | 中文文档

**Note: The English document is not yet complete**

一个 JavaScript 类型推断和自动转换库，让你能够使用 `flex [变量名]` 风格的动态类型声明。

## 特性

- **智能类型推断**：自动检测输入值的类型并转换为最合适的 JavaScript 类型
- **自动类型转换**：字符串数字转为数字，字符串布尔值转为布尔值，JSON 字符串转为对象等
- **类型锁定机制**：提供字符串锁定、布尔锁定和类型锁定功能，防止不必要的类型转换
- **数学运算安全**：在类型安全的前提下支持加减乘除等数学运算
- **链式操作**：支持流畅的链式方法调用
- **类型历史追踪**：记录变量的类型变化历史
- **跨平台支持**：支持 Node.js 和浏览器环境

**本js采用“以存储空间换取性能”的优化策略。** 
在对象初始化时，所有类型推断和自动转换逻辑已预先执行并缓存结果。这意味着对象创建时的开销略有增加（存储空间增加），但在后续访问 `.value` 或进行操作时，性能将得到显著提升，避免了重复的类型检查和转换计算。

## 快速开始

### 安装

**从 npm 安装（Node 环境用）：**
```bash
npm install flextypeonjs
```

**从 GitHub 安装（开发用）：**
```bash
npm install github:Mxher07/flextype
```

**使用 CDN（浏览器环境）：**
```html
<!-- 使用 jsDelivr CDN -->
<script src="https://cdn.jsdelivr.net/gh/Mxher07/flextype@main/dist/flextype.umd.js"></script>

<!-- 或者使用 unpkg CDN -->
<script src="https://unpkg.com/github:Mxher07/flextype/dist/flextype.umd.js"></script>
```

**手动安装：**
1. 下载仓库到本地：
```bash
git clone https://github.com/Mxher07/flextype.git
cd flextype
npm install
npm run build
```

### 基本用法

**在 Node.js / ES Modules 中：**
```javascript
import { FlexType, flex, declareFlex } from 'flextypeonjs';
// 或者如果你手动安装了仓库
import { FlexType, flex, declareFlex } from './path/to/dist/flextype.esm.js';
```

**在 CommonJS 中：**
```javascript
const { FlexType, flex, declareFlex } = require('flextypeonjs');
// 或者如果你手动安装了仓库
const { FlexType, flex, declareFlex } = require('./path/to/dist/flextype.cjs.js');
```

**在浏览器中：**
```html
<script src="https://cdn.jsdelivr.net/gh/Mxher07/flextype@main/dist/flextype.umd.js"></script>
<script>
// 通过全局变量 flextype 访问
const { FlexType, flex, declareFlex } = flextype;
</script>
```

## 语言特性

### 自动类型转换

FlexType 会自动将字符串转换为最合适的类型：

```javascript
import { flex } from 'flextypeonjs';

// 字符串数字转为数字
const age = flex('age', '25');
console.log(age.value); // 25
console.log(age.type);  // "number"

// 字符串布尔值转为布尔值
const active = flex('active', 'true');
console.log(active.value); // true
console.log(active.type);  // "boolean"

// JSON 字符串转为对象
const data = flex('data', '{"items": [1, 2, 3]}');
console.log(data.value); // { items: [1, 2, 3] }
console.log(data.type);  // "object"

// 数组字符串转为数组
const tags = flex('tags', '["js", "node"]');
console.log(tags.value); // ["js", "node"]
console.log(tags.type);  // "array"
```

### 类型锁定

防止不必要的类型转换：

```javascript
import { flex } from 'flextypeonjs';

// 字符串锁定 - 阻止字符串转换为其他类型
const id = flex('id', '123').strLock();
console.log(id.value); // "123" (保持字符串)

// 布尔锁定 - 布尔值在运算中保持 0/1 范围
const flag = flex('flag', true).boolLock();
const result = flag.add(0.5); // 1 + 0.5 = 1 (限制在 0-1 范围)

// 类型锁定 - 完全阻止类型转换
const value = flex('value', 'hello').typeLock();
console.log(value.value); // "hello" (不会尝试任何转换)
```

### 数学运算

在类型安全的前提下进行数学运算：

```javascript
import { flex } from 'flextypeonjs';

const a = flex('a', '10');  // 字符串 "10" → 数字 10
const b = flex('b', 5);

// 加法
const sum = a.add(b);
console.log(sum.value); // 15

// 减法
const difference = a.subtract(b);
console.log(difference.value); // 5

// 乘法
const product = a.multiply(2);
console.log(product.value); // 20

// 除法
const quotient = a.divide(b);
console.log(quotient.value); // 2
```

### 字符串操作

```javascript
import { flex } from 'flextypeonjs';

const text = flex('text', 'hello');

// 字符偏移（简单的加密）
const encoded = text.charShift(1);
console.log(encoded.value); // "ifmmp"

const decoded = encoded.charShift(-1);
console.log(decoded.value); // "hello"
```

### 数组和对象操作

```javascript
import { flex, declareFlex } from 'flextypeonjs';

// 处理复杂数据结构
const config = flex('config', '{"users": ["Alice", "Bob"], "settings": {"theme": "dark"}}');

// 获取嵌套属性
const theme = config.get('settings').get('theme');
console.log(theme.value); // "dark"

// 数组操作
const users = config.get('users');
users.push('Charlie');
console.log(users.value); // ["Alice", "Bob", "Charlie"]

// 批量声明
const envVars = declareFlex({
  port: '3000',
  debug: 'true',
  database: '{"host": "localhost", "port": 5432}'
});
```

## 可用功能

### 核心类和方法

#### FlexType 类
- `constructor(value, name, options)` - 创建 FlexType 实例
- `value` - 获取转换后的值
- `type` - 获取当前类型
- `name` - 获取变量名
- `typeHistory` - 获取类型变化历史
- `isLocked` - 检查是否锁定

#### 类型检查方法
- `isString()` - 检查是否为字符串
- `isNumber()` - 检查是否为数字
- `isBoolean()` - 检查是否为布尔值
- `isArray()` - 检查是否为数组
- `isObject()` - 检查是否为对象
- `isNull()` - 检查是否为 null
- `isUndefined()` - 检查是否为 undefined

#### 数学运算方法
- `add(other)` - 加法
- `subtract(other)` - 减法
- `multiply(other)` - 乘法
- `divide(other)` - 除法

#### 锁定方法
- `strLock()` - 字符串锁定
- `boolLock()` - 布尔锁定
- `typeLock()` - 类型锁定
- `unlock()` - 解除所有锁定

#### 转换方法
- `toString()` - 转换为字符串
- `toNumber()` - 转换为数字
- `toBoolean()` - 转换为布尔值

#### 调试方法
- `debug()` - 获取完整的调试信息

### 工具函数

- `flex(name, value, options)` - 创建单个 FlexType 变量
- `declareFlex(variables, options)` - 批量声明多个 FlexType 变量

## 模板使用

### 配置文件处理

```javascript
import { declareFlex } from 'flextypeonjs';

// 处理环境变量或配置文件
const config = declareFlex({
  appName: 'My App',
  port: process.env.PORT || '3000',
  debug: process.env.DEBUG || 'false',
  features: process.env.FEATURES || '["auth", "api"]',
  database: process.env.DB_CONFIG || '{"host": "localhost", "port": 5432}'
});

console.log(config.port.value);    // 3000 (number)
console.log(config.debug.value);   // false (boolean)
console.log(config.features.value); // ["auth", "api"] (array)
```

### 表单数据处理

```javascript
import { declareFlex } from 'flextypeonjs';

function processFormData(formData) {
  return declareFlex({
    username: formData.username,
    age: formData.age,
    newsletter: formData.newsletter || 'false',
    preferences: formData.preferences || '{}'
  });
}

// 使用示例
const formData = {
  username: 'john_doe',
  age: '25',
  newsletter: 'true'
};

const processed = processFormData(formData);
console.log(processed.age.value);        // 25 (number)
console.log(processed.newsletter.value); // true (boolean)
```

### API 响应处理

```javascript
import { flex } from 'flextypeonjs';

async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.text(); // 假设返回的是字符串

  // 自动转换 JSON 字符串
  return flex('userData', data);
}

// 使用
// 假设 fetchUserData 返回一个包含 { name: "John Doe" } 的 FlexType 实例
// console.log(userData.value.name); // 自动转换为对象后访问属性
```

### 布尔值数学运算

```javascript
import { flex } from 'flextypeonjs';

// 布尔值运算示例
const active = flex('active', true);
// boolLock() 使得 true 在数学运算中被视为 1
// 1 - 1 = 0
// toBoolean() 将 0 转换为 false
const result = active.boolLock().subtract(1).toBoolean();
console.log(result.value); // false
```

## 许可证

MIT License
