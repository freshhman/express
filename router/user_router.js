import express from 'express'
import db from '../db/index.js'
import multer from 'multer';
import { getAllUser, addUser, getArticle, getPoem, getGallery } from '../controller/user_ctrl.js'
import path from 'path'
import { fileURLToPath } from 'url'; // 引入 fileURLToPath 函数
import  jwt  from 'jsonwebtoken';

const jwtSecretKey = 'your-secret-key';

const router = new express.Router()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = path.join(__dirname, '../image/');
    cb(null, destinationPath); // 请确保该路径存在
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage });
// 验证登录的api
router.post('/login', async (req,res)=>{
  const { username, password} = req.body;

  try{
    const [rows] = await db.execute('SELECT id, username FROM admin WHERE username = ? AND password = ?', [username,password])
    if(rows.length === 1){
      const user = {id:rows[0].id,username:rows[0].username};
      const token = jwt.sign(user,jwtSecretKey,{ expiresIn: '1h' })
      res.json({token})
    }else{
      res.status(401).json({ message: 'Invalid username or password' });
    }
  }catch (error) {
    console.error('Error during login', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})
// 获取用户的api
router.get('/admin', getAllUser)
router.post('/admin', addUser);
// 获取poem的接口
router.get('/poem',getPoem)
// 获取文章的api
router.get('/article', getArticle)
router.post('/article', upload.single('image'), async (req, res) => {
  const { title, category, amount, status, create_time, update_time, text, description } = req.body;
  const image = req.file ? req.file.filename:null // 使用 filename 属性获取上传的文件名
  const sql = 'INSERT INTO article(title, category, amount, pic, status, create_time, update_time, text, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [title, category, amount, image, status, create_time, update_time, text, description];

  try {
    await db.query(sql, values);
    console.log('Image inserted into the database');
    res.json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error inserting image into the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// 修改文章的api
router.patch('/article/:id',upload.single('pic'),async (req,res)=>{
  const id = req.params.id;
  const { title, category, amount, status, create_time, update_time, text, description } = req.body;
  const pic = req.file ? req.file.filename:null

  const sql = 'UPDATE article SET title = ?, category = ?, amount = ?,pic = ?, status = ?, create_time = ?, update_time = ?, text = ?, description = ? WHERE id = ?';
  const values = [title, category, amount, pic, status, create_time, update_time, text, description,id]
  try{
    await db.query(sql,values)
    console.log('updated');
    res.json({ message: 'data uploaded successfully' });
  } catch(error){
    console.error('error update',error);
    res.status(500).json({error:'Internal server error'})
  }

})
router.delete('/article/:id', async (req,res)=>{
  const id = req.params.id;
  const sql = 'DELETE FROM article WHERE id = ?;'
  try{
    await db.query(sql,id)
    console.log('delete data successfully!');
    res.json({message:'data successfully! '})
  }catch(error){
    console.error('error delete',error);
    res.status(500).json({error:'Internal server error'})
  }
})
// article查询的api
router.get('/article/search/:name', async (req,res)=>{
  const name = req.params.name;
  const sql = 'SELECT * FROM article where category = ?'

  try{
    const results = await db.query(sql, [name]);
    console.log('Search data successfully!', results);
    res.json({ message: 'Data successfully!', data: results });
  } catch(error){
    console.error('Error searching', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})
// article改变状态的api
// gallery状态的改变
router.post('/article/status/:id',async (req,res)=>{
  const id = req.params.id;
  console.log(id,);
  const {status} = req.body;
  const values = [status ,id]
  const sql = 'UPDATE article SET status = ? WHERE id = ?;'

  try {
    await db.query(sql, values);
    console.log('change status successfully!');
    res.json({ message: 'change successfully!' });
  } catch (error) {
    console.error('Error change', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  
})

//gallery相关的api
router.get('/gallery',getGallery)
router.post('/gallery',upload.single('view'), async (req,res)=>{
  const { title, description, time, status,update_time } = req.body;
  const view = req.file ? req.file.filename : null;
  const sql =  'INSERT INTO gallery (title,description,time,view,status,update_time) VALUES(?,?,?,?,?,?)'
  const values = [title, description, time, view,status,update_time]

  try{
    await db.query(sql,values);
    console.log('Image inserted into the database');
    res.json({ message: 'Image uploaded successfully' });
  } catch(error){
    console.error('Error inserting image into the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})
router.patch('/gallery/:id',upload.single('view'),async (req,res)=>{
  const id = req.params.id;
  const { title, description, time, status, update_time} = req.body
  const view = req.file ? req.file.filename : null;

  const sql = 'UPDATE gallery SET title = ?, description = ?, time = ?,view = ?, status = ?, update_time = ? WHERE id = ?'
  const values = [title, description, time, view, status, update_time, id]
  try{
    await db.query(sql,values)
    console.log('updated gallery!');
    res.json({ message: 'data uploaded successfully' });
  } catch(error){
    console.error('error update',error);
    res.status(500).json({error:'Internal server error'})
  }
})
router.delete('/gallery/:id', async (req,res)=>{
  const id = req.params.id;
  const sql = 'DELETE FROM gallery WHERE id = ?;'

  try{
    await db.query(sql,id)
    console.log('delete data successfully!');
    res.json({message:'data successfully! '})
  }catch(error){
    console.error('error delete',error);
    res.status(500).json({error:'Internal server error'})
  }
})
// gallery的查询接口
router.get('/gallery/search/:name', async (req, res) => {
  const name = req.params.name; // Change "title" to "name"
  const sql = 'SELECT * FROM gallery WHERE title = ?';

  try {
    const results = await db.query(sql, [name]);
    console.log('Search data successfully!', results);
    res.json({ message: 'Data successfully!', data: results });
  } catch (error) {
    console.error('Error searching', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// gallery状态的改变
router.post('/gallery/status/:id',async (req,res)=>{
  const id = req.params.id;
  console.log(id,);
  const {status} = req.body;
  const values = [status ,id]
  const sql = 'UPDATE gallery SET status = ? WHERE id = ?;'

  try {
    await db.query(sql, values);
    console.log('change status successfully!');
    res.json({ message: 'change successfully!' });
  } catch (error) {
    console.error('Error change', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  
})

export default router;
