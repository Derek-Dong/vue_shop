<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 列表卡片区域 -->
    <el-card class="box-card">
      <!-- 搜索框部分 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryParams.query" @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <!-- 添加用户按钮 -->
          <el-button type="success" @click="showDialogVisible">添加用户</el-button>
          <!-- 添加用户对话框部分 -->
          <el-dialog
            title="添加用户"
            :visible.sync="dialogVisible"
            width="50%"
            :close-on-click-modal="false"
            @close="addUserFormReset"
          >
            <!-- 对话框主体区域 -->
            <el-form
              :model="addUserForm"
              :rules="addUserFormRul"
              ref="addUserFormRef"
              label-width="100px"
              class="demo-ruleForm"
            >
              <!-- 添加用户名 -->
              <el-form-item label="用户名" prop="username">
                <el-input v-model="addUserForm.username"></el-input>
              </el-form-item>
              <!-- 添加用户密码 -->
              <el-form-item label="密码" prop="password">
                <el-input v-model="addUserForm.password" show-password></el-input>
              </el-form-item>
              <!-- 添加用户邮箱 -->
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="addUserForm.email"></el-input>
              </el-form-item>
              <!-- 添加用户手机号 -->
              <el-form-item label="手机号码" prop="mobile">
                <el-input v-model="addUserForm.mobile"></el-input>
              </el-form-item>
            </el-form>
            <!-- 对话框底部区域 -->
            <span slot="footer" class="dialog-footer">
              <el-button type="info" @click="resetForm">重 置</el-button>
              <el-button type="primary" @click="addUserFormBtn">确 定</el-button>
            </span>
          </el-dialog>
        </el-col>
      </el-row>
      <!-- 用户数据列表部分 -->
      <el-table :data="usersList" style="width: 100%" stripe border>
        <!-- 索引列 type=index -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽 -->
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="updateState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <!-- 要访问原数据，用作用域插槽 -->
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="修改信息"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>

            <!-- 删除按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="删除用户"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeUserInfo(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 设置权限 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="info"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码部分 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalNum"
      ></el-pagination>
    </el-card>
    <!-- 修改用户信息对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="editFormClosed"
    >
      <!-- 对话框主体部分 -->
      <el-form
        :model="editForm"
        :rules="addUserFormRul"
        ref="editUserFormRef"
        label-width="80px"
        class="demo-ruleForm"
      >
        <!-- 用户名不可修改 -->
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <!-- 修改邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <!-- 修改手机号 -->
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormBtn">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="resetSelectedRole"
    >
      <!-- 对话框主体区域 -->
      <div>
        <p>当前用户： {{userInfo.username}}</p>
        <p>当前角色： {{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setNewRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义手机表单校验规则
    var checkMobile = (rule, value, callback) => {
      const mobileRex = /^1(3|4|5|7|8)\d{9}$/;
      if (mobileRex.test(value)) {
        // 校验通过
        return callback();
      }
      // 校验不合法
      callback(new Error('请输入正确的手机号码'));
    };
    return {
      // 请求参数对象
      queryParams: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      //   用户数据列表
      usersList: [],
      // 用户数据列表数量
      totalNum: 0,
      // 对话框显示隐藏属性
      dialogVisible: false,
      // 添加用户表单对象
      addUserForm: {
        username: '',
        password: '',
        mobile: '',
        email: ''
      },
      // 添加用户表单校验规则对象
      addUserFormRul: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户信息对话框显示与隐藏
      editDialogVisible: false,
      // 修改用户信息表单对象
      editForm: {},
      // 控制分配角色对话框显示与隐藏
      setRoleDialogVisible: false,
      // 当前打开分配角色对话框的用户信息对象
      userInfo: {},
      // 角色列表数据
      roleList: [],
      // 已选择的新角色的ID
      selectedRoleId: ''
    };
  },
  created() {
    this.getUsersList();
  },
  methods: {
    // 发起获取用户列表数据请求
    async getUsersList() {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryParams
      });
      //   console.log(res);
      //   当请求失败，弹出提示信息，不再执行后面代码
      if (res.meta.status !== 200) {
        return this.$message.error('请求用户数据列表失败！');
      }
      //   当请求成功，把数据保存到usersList中
      this.usersList = res.data.users;
      // 更新用户数据列表总数
      this.totalNum = res.data.total;
    },
    // 改变每页显示几条记录
    handleSizeChange(newPage) {
      // console.log(newPage)
      this.queryParams.pagesize = newPage;
      // 重新请求用户数据列表
      this.getUsersList();
    },
    // 点击当前页
    handleCurrentChange(page) {
      this.queryParams.pagenum = page;
      // 重新请求用户数据列表
      this.getUsersList();
    },
    // 更新用户状态
    async updateState(user) {
      // console.log(user)
      const { data: res } = await this.$http.put(
        `users/${user.id}/state/${user.mg_state}`
      );
      // 请求修改用户状态失败
      if (res.meta.status !== 200) {
        // 取反重置用户状态
        user.mg_state = !user.mg_state;
        // console.log(res);
        return this.$message.error(
          '用户状态修改失败！\n' + res.meta.status + ' : ' + res.meta.msg
        );
      }
      // 请求用户状态修改成功
      this.$message.success('用户状态修改成功！');
    },
    // 显示对话框
    showDialogVisible() {
      this.dialogVisible = true;
    },
    // 监听对话框关闭事件
    addUserFormReset() {
      this.resetForm();
    },
    // 重置表单项
    resetForm() {
      this.$refs.addUserFormRef.resetFields();
    },
    // 点击添加用户按钮
    addUserFormBtn() {
      // 先进行表单预验证
      this.$refs.addUserFormRef.validate(async flag => {
        if (!flag) {
          return this.$message.error('请按照要求填写信息！');
        }
        // 预验证通过，发起添加新用户请求
        const { data: res } = await this.$http.post('users', this.addUserForm);

        if (res.meta.status === 201) {
          // 关闭对话框
          this.dialogVisible = false;
          // 用户创建成功，重新获取用户列表
          this.getUsersList();
          // console.log(res.data);
          return this.$message.success(res.meta.msg);
        }
        // 请求创建新用户失败
        return this.$message.error(res.meta.status + ' : 创建新用户失败！');
      });
    },
    // 显示修改用户信息对话框
    async showEditDialog(id) {
      // console.log(id)
      // 根据用户id查询信息
      const { data: res } = await this.$http.get('users/' + id);
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status + ' : 查询用户信息失败！');
      }

      // 查询请求成功
      this.editForm = res.data;
      // 弹出对话框
      this.editDialogVisible = true;
    },
    // 监听修改用户信息对话框关闭事件
    editFormClosed() {
      // 对话框关闭，移除所有校验结果
      this.$refs.editUserFormRef.clearValidate();
    },
    // 提交修改用户信息按钮点击事件
    editFormBtn() {
      // 提交之前需要进行预验证
      this.$refs.editUserFormRef.validate(async flag => {
        // console.log(flag);
        if (!flag) return null;
        // 表单预验证通过才发起修改请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        );
        if (res.meta.status !== 200) {
          // 修改失败，返回提示信息
          return this.$message.error(res.meta.status + ' : 修改用户信息失败！');
        }
        // 修改请求成功
        // 关闭对话框
        this.editDialogVisible = false;
        // 重新读取用户列表
        this.getUsersList();
        // 返回提示修改成功信息
        return this.$message.success('更新用户信息成功！');
      });
    },
    // 删除用户按钮点击事件
    async removeUserInfo(id) {
      // console.log(id);
      const removeConfirm = await this.$confirm(
        '此操作将永久删除用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);
      // 当点击确定，返回字符串 confirm
      // 当点击取消，返回字符串 cancle
      // console.log(removeConfirm);
      if (removeConfirm === 'confirm') {
        // 发起删除用户请求
        const { data: res } = await this.$http.delete('users/' + id);
        // 请求失败，返回错误提示
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.status + ' : 删除用户失败！');
        }
        // 请求成功，重新读取用户列表
        this.getUsersList();
        // 返回成功提示
        return this.$message.success('删除用户成功！');
      }
    },
    // 显示分配角色对话框
    async showSetRoleDialog(role) {
      // 请求角色列表数据
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status + ' : 获取角色列表失败！');
      }
      this.roleList = res.data;
      // console.log(role);
      this.userInfo = role;

      this.setRoleDialogVisible = true;
    },
    // 监听分配角色对话框关闭事件
    resetSelectedRole() {
      // 清空已选择的新角色ID
      this.selectedRoleId = '';
      this.userInfo = {};
    },
    // 确定分配新角色
    async setNewRole() {
      // 先判断用户是否有选择新角色
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的新角色！');
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status + ' ： 更新角色失败！');
      }
      // 请求更新角色成功
      // 成功提示
      this.$message.success('分配新角色成功！');
      // 重新读取用户列表
      this.getUsersList();
      // 关闭对话框
      this.setRoleDialogVisible = false;
    }
  }
};
</script>

<style lang="less" scoped>
</style>
