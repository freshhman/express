import db from '../db/index.js';
import multer from 'multer';
const jwtSecretKey = 'your-secret-key';
// 配置 multer 中间件
const storage = multer.memoryStorage();
const upload = multer({ storage });
// 按需导出getAllUser方法
export async function getAllUser(req,res){
    try{
        const [rows] =await db.query('select * from admin')
        res.send({
            status:0 ,
            message : '用户列表数据获取成功', 
            data : rows
        })
    } catch(e){
        res.send({
            status : 1,
            message : '获取用户列表失败',
            desc : e.message
        })
    }

}
export async function addUser(req, res) {
    const { username, password,pic, email } = req.body;
  
    try {
      const sql = 'INSERT INTO admin (username, password, pic, email) VALUES (?, ?, ?, ?)';
      const result = await db.query(sql, [username, password, pic , email]);
      console.log('Data inserted:', result);
      res.send({
        status: 0,
        message: '用户添加成功',
        data: result,
      });
    } catch (e) {
      res.send({
        status: 1,
        message: '添加用户失败',
        desc: e.message,
      });
    }
}
// 获取article get请求
export async function getArticle(req,res){
    try{
        const [rows] =await db.query('select * from article') 
        res.send({
            status:0 ,
            message : '用户列表数据获取成功', 
            data : rows
        })
    }
    catch(e){
        res.send({
            status : 1,
            message : '获取用户列表失败',
            desc : e.message
        })
    
    }
}
// 获取poem的接口
export async function getPoem(req,res){
    try{
        const [row] = await db.query('select * from poem')
        res.send({
            status:0,
            message:'获取poem成功',
            data:row
        })
    }catch(e){
        res.send({
            status:1,
            message:'获取poem信息失败',
            desc:e.message
        })
    }
}
// 获取gallery的get接口
export async function getGallery(req,res){
    try{
        const [row] = await db.query('select * from gallery')
        res.send({
            status :0 ,
            message:'获取gallery成功',
            data:row
        })
    } catch(e){
        res.send({
            status:1,
            message:'获取gallery失败',
            desc:e.message
        })
    }
}
// tags相关接口
export async function getTags(req,res){
    try{
        const [rows] = await db.query('select * from tags')
        res.send({
            status :1,
            message:'获取tags成功',
            data:rows
        })
    }catch (e){
        res.send({
            status:1,
            message:'获取tags失败',
            desc :e.message
        })
    }
}

// 获取category的api
export async function getCategory(req, res){
    try{
        const [rows] = await db.query('select * from category_table')
        res.send({
            status:1,
            message:'获取category数据成功',
            data:rows
        })
    } catch(e){
        res.send({
            status:1,
            message:'获取category数据失败',
            desc:e.message
        })
    }
}

export async function getComment(req,res){
    try{
        const [rows] = await db.query('select * from comments')
        res.send({
            status:0,
            message:'获取category数据成功',
            data:rows
        })
    }catch(e){
        res.send({
            status:1,
            message:'获取category数据失败',
            desc:e.message
        })
    }
}

// 获取setting 的api
export async function getSetting (req,res){
    try{
        const [rows] = await db.query('select * from settings')
        res.send({
            status:0,
            message:'获取数据成功',
            data:rows
        })
    } catch(e){
        res.send({
            status:1,
            message:'settings数据失败',
            desc:e.message
        }) 
    }
}