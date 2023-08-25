import express from 'express'
import db from '../db/index.js'
import multer from 'multer';
import { getAllUser, addUser, getArticle, getPoem, getGallery, getTags, getCategory, getComment, getSetting } from '../controller/user_ctrl.js'
import path from 'path'
import { fileURLToPath } from 'url'; // 引入 fileURLToPath 函数
import  jwt  from 'jsonwebtoken';
import { error } from 'console';
const jwtSecretKey = 'your-secret-key'; // Replace with a secure secret key

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

let upload = multer({ storage });
// 验证登录的api
global.userrole = null
router.post('/login', async (req,res)=>{
  const { username, password} = req.body;

  try{
    const [rows] = await db.execute('SELECT user_id, username, role FROM admin WHERE username = ? AND password = ?', [username,password])
    if (rows.length === 1) {
      const user = { id: rows[0].user_id, username: rows[0].username, role:rows[0].role};
      console.log(user.role);
      userrole=user.role
      const token = jwt.sign(user, jwtSecretKey, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
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
  const { title, category, amount, status, create_time, update_time, text, description, tag } = req.body;
  const image = req.file ? req.file.filename : null;
  const sql = 'INSERT INTO article(title, category, amount, pic, status, create_time, update_time, text, description, tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [title, category, amount, image, status, create_time, update_time, text, description, tag];
  console.log(userrole);
  try {
    if (userrole === 'admin') {
      await db.query(sql, values);
      console.log('Image inserted into the database');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    } else {
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  } catch (error) {
    console.error('Error inserting article into the database:', error);
    res.status(500).json({ error: 'Internal server error' }); // 使用状态码 500 表示服务器内部错误
  }
});
// 修改文章的api
router.patch('/article/:id',upload.single('pic'),async (req,res)=>{
  const id = req.params.id;
  const { title, category, amount, status, create_time, update_time, text, description } = req.body;
  const pic = req.file ? req.file.filename:null

  const sql = 'UPDATE article SET title = ?, category = ?, amount = ?,pic = ?, status = ?, create_time = ?, update_time = ?, text = ?, description = ? WHERE article_id = ?';
  const values = [title, category, amount, pic, status, create_time, update_time, text, description,id]
  console.log(userrole);
  try{
    if(userrole === 'admin'){
      await db.query(sql,values)
      console.log('updated');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    }else{
      console.log('你没有权限');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  } catch(error){
    console.error('error update',error);
    res.status(500).json({error:'Internal server error'})
  }
  

})
router.delete('/article/:id',async (req,res)=>{
  const id = req.params.id;
  const sql = 'DELETE FROM article WHERE article_id = ?;'
  try{
    if(userrole === 'admin'){
      await db.query(sql,id)
      console.log('delete data successfully!');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    }else{
      console.log('你没有权限');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
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
//查询文章分类的内容
router.get('/article/searchcategory/:name', async (req,res)=>{
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
// article查询tag的api
router.get('/article/tag/:name', async (req, res) => {
  const name = req.params.name;
  console.log(name);
  const sql = "SELECT * FROM article WHERE tag LIKE ?";
  try {
    const results = await db.query(sql, [`%${name}%`]);
    console.log('Search data successfully!', results);
    res.json({ message: 'Data successfully!', data: results });
  } catch (error) {
    console.error('Error searching', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// article改变状态的api
// gallery状态的改变
router.post('/article/status/:id',async (req,res)=>{
  const id = req.params.id;
  console.log(id,);
  const {status} = req.body;
  const values = [status ,id]
  const sql = 'UPDATE article SET status = ? WHERE article_id = ?;'

  try {
    if(userrole === 'admin'){
      await db.query(sql, values);
      console.log('change status successfully!');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    }else{
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  } catch (error) {
    console.error('Error change', error);
    res.status(500).json({ error: 'Internal server error' }); // 使用状态码 500 表示服务器内部错误
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
    if(userrole === 'admin'){
      await db.query(sql,values);
      console.log('Image inserted into the database');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    }else{
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
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
    if (userrole === 'admin'){
      await db.query(sql,values)
      console.log('updated gallery!');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    }else{
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  } catch(error){
    console.error('error update',error);
    res.status(500).json({error:'Internal server error'})
  }
})
router.delete('/gallery/:id', async (req,res)=>{
  const id = req.params.id;
  const sql = 'DELETE FROM gallery WHERE id = ?;'

  try{
    if(userrole === 'admin'){
      await db.query(sql,id)
      console.log('delete data successfully!');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    }else {
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
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
    if(userrole === 'admin'){
      await db.query(sql, values);
      console.log('change status successfully!');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    }else{
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  } catch (error) {
    console.error('Error change', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  
})
// tags相关api
router.get('/tags', getTags)
router.post('/tags',async (req,res)=>{
  const {tag,update_time} = req.body
  const sql = 'INSERT INTO tags (tag, update_time) VALUES(?,?)'
  const values = [tag, update_time]
  console.log(tag);
  console.log(req.body);
  try{
    if(userrole === 'admin') {
      await db.query(sql, values)
      console.log('add a tag successfully!');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    }else{
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  }catch (error) {
    console.error('Error add', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})
// 删除特定tag的api
router.delete('/tags/:id', async (req,res)=>{
  const id = req.params.id;
  const sql = 'DELETE FROM tags WHERE id = ?;'

  try{
    if(userrole === 'admin'){
      await db.query(sql,id)
      console.log('delete this tag successfully');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    }else{
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  } catch (e){
    console.error('error delet', e);
    res.status(500).json({error:'Internal server error'})
  }
})
// 修改tag标签
router.patch('/tags/:id',async (req,res)=>{
  const id = req.params.id
  const {tag, update_time} = req.body

  const sql = 'UPDATE tags SET tag = ?, update_time = ? WHERE id = ?'
  const value = [ tag, update_time, id]

  try {
    if( userrole === 'admin' ){
      await db.query(sql,value)
      console.log('updated tag');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    }else{
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  } catch(e){
    console.error('error update',error);
    res.status(500).json({error:'server error'})
  }
})
// 查找tag相关搜索的api
router.get('/tags/search/:name', async (req, res) => {
  const name = req.params.name; // Change "title" to "name"
  const sql = 'SELECT * FROM tags WHERE tag = ?';

  try {
    const results = await db.query(sql, [name]);
    console.log('Search data successfully!', results);
    res.json({ message: 'Data successfully!', data: results });
  } catch (error) {
    console.error('Error searching', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// 获取category的api
router.get('/category',getCategory)
// 删除特定的category的数据
router.delete('/category/:id', async (req,res)=>{
  const id = req.params.id;
  const sql = 'DELETE FROM category_table WHERE id = ?;'

  try{
    if(userrole === 'admin'){
      await db.query(sql,id)
      console.log('delete this category successfully');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    }else{
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  } catch (e){
    console.error('error delet', e);
    res.status(500).json({error:'Internal server error'})
  }
})

router.post('/category',async (req,res)=>{
  const {category,update_time} = req.body
  const sql = 'INSERT INTO category_table (category, update_time) VALUES(?,?)'
  const values = [category, update_time]
  console.log(category);
  console.log(req.body);
  try{
    if (userrole === 'admin'){
      await db.query(sql, values)
      console.log('add a category successfully!');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    } else {
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  }catch (error) {
    console.error('Error add', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// 修改category标签
router.patch('/category/:id', async (req,res)=>{
  const id = req.params.id
  const {category, update_time} = req.body

  const sql = 'UPDATE category_table SET category = ?, update_time = ? WHERE id = ?'
  const value = [ category, update_time, id]

  try {
    if(userrole === 'admin'){
      await db.query(sql,value)
      console.log('updated category');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    } else {
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  } catch(e){
    console.error('error update',error);
    res.status(500).json({error:'server error'})
  }
})
// category的查询接口
router.get('/category/search/:name', async (req, res) => {
  const name = req.params.name; // Change "title" to "name"
  const sql = 'SELECT * FROM category_table WHERE category = ?';

  try {
    const results = await db.query(sql, [name]);
    console.log('Search data successfully!', results);
    res.json({ message: 'Data successfully!', data: results });
  } catch (error) {
    console.error('Error searching', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 文章评论相关api
router.get('/comments',getComment)
// 删除特定的comment的数据
router.delete('/comments/:id', async (req,res)=>{
  const id = req.params.id;
  const sql = 'DELETE FROM comments WHERE comment_id = ?;'

  try{
    if (userrole === 'admin'){
      await db.query(sql,id)
      console.log('delete this category successfully');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    } else {
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  } catch (e){
    console.error('error delet', e);
    res.status(500).json({error:'Internal server error'})
  }
})
// setting相关的api
router.get('/settings', getSetting)
// setting修改相关的api
router.patch('/settings/:id', async (req,res)=>{
  const id = req.params.id
  const {title, mark, content} = req.body

  const sql = 'UPDATE settings SET title = ?, mark = ?, content =? WHERE id = ?'
  const value = [ title, mark, content, id]

  try {
    if ( userrole === 'admin'){
      await db.query(sql,value)
      console.log('updated settings');
      res.json({message:'settings uptated'})
    } else {
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  } catch(e){
    console.error('error update',error);
    res.status(500).json({error:'server error'})
  }
})
// setting的post接口
router.post('/settings', async (req,res)=>{
  const {title, mark, content} = req.body
  const sql = 'INSERT INTO settings (title, mark, content) VALUES(?,?,?)'
  const value = [title, mark, content]

  try {
    if ( userrole === 'admin'){
      await db.query(sql,value)
      console.log('add settings');
      res.status(201).json({ message: 'Article uploaded successfully' }); // 使用状态码 201 表示资源创建成功
    } else {
      console.log('该用户没有权限进行该操作');
      res.status(403).json({ message: 'Access denied' }); // 使用状态码 403 表示权限不足
    }
  }catch(e){
    console.error('error add',e);
    res.status(500).json({error:'server error'})
  }
})
export default router;
