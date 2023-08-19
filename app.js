import express from 'express';
import userRouter from './router/user_router.js';
import cors from 'cors';
import { fileURLToPath } from 'url'; // 引入 fileURLToPath 函数
import path from 'path'; // 引入 path 模块

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 获取当前模块的文件路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前模块所在的文件夹路径
const __dirname = path.dirname(__filename);

// 使用 express.static 中间件来服务静态文件（图片）
app.use('/image',express.static(__dirname+'/image/'));

// 使用 userRouter 路由
app.use('/api', userRouter);
app.listen(3000, () => {
  console.log('Server running at http://127.0.0.1');
});
