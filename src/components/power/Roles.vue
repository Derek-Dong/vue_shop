<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="success" @click="showAddRoleDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 添加角色对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRoleDialogVisible"
        width="50%"
        :close-on-click-modal="false"
        @close="resetAddRoleForm"
      >
        <!-- 对话框主体区域 -->
        <!-- 添加角色表单区域 -->
        <el-form
          ref="addRoleFormRef"
          :model="addRoleForm"
          label-width="100px"
          :rules="addRoleFormRul"
        >
          <!-- 角色名称 -->
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <!-- 角色描述 -->
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button type="info" @click="resetFormBtn">重 置</el-button>
          <el-button type="primary" @click="addRoleBtn">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 角色数据列表区域 -->
      <el-table :data="rolesList" stripe border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <!-- 作用域插槽 -->
          <template v-slot="scoped">
            <el-row
              :class="['bbottom',index1===0?'btop':'','vcenter']"
              v-for="(item1,index1) in scoped.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRight(scoped.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过嵌套for循环渲染二级权限 -->
                <el-row
                  :class="[index2===0 ? '' : 'btop','vcenter']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="8">
                    <el-tag
                      closable
                      type="success"
                      @close="deleteRight(scoped.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="16">
                    <el-tag
                      closable
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      @close="deleteRight(scoped.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scoped.row}}
            </pre>-->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <!-- 作用域插槽 -->
          <template v-slot="scoped">
            <!-- 编辑角色按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="showEditRoleDialog(scoped.row.id)"
            >编辑</el-button>

            <!-- 删除角色按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="deleteRole(scoped.row.id)"
            >删除</el-button>

            <!-- 分配权限按钮 -->
            <el-button
              type="info"
              icon="el-icon-setting"
              size="small"
              @click="showSetRightsDialog(scoped.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 编辑角色对话框区域 -->
      <el-dialog
        title="编辑角色"
        :visible.sync="editRoleDialogVisible"
        width="50%"
        :close-on-click-modal="false"
        @close="resetEditRoleForm"
      >
        <!-- 对话框主体区域 -->
        <!-- 添加角色表单区域 -->
        <el-form
          ref="editRoleFormRef"
          :model="editRoleForm"
          label-width="100px"
          :rules="addRoleFormRul"
        >
          <!-- 角色名称 -->
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <!-- 角色描述 -->
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button plain @click="editRoleDialogVisible=false">取 消</el-button>
          <el-button type="primary" @click="editRoleBtn">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限对话框区域 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightsDialogVisible"
        width="50%"
        @close="clearRightsKey"
      >
        <!-- 对话框主体，树形权限列表区域 -->
        <el-tree
          :data="rightList"
          :props="rightListProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="rightskey"
          ref="treeRef"
        ></el-tree>
        <!-- 对话框底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="updateRoleRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 角色列表
      rolesList: [],
      // 控制添加角色对话框显示和隐藏
      addRoleDialogVisible: false,
      // 添加角色表单对象
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单验证规则
      addRoleFormRul: {
        // 角色名称验证
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 6,
            message: '角色名称需要 2 到 6 个字符组成',
            trigger: 'blur'
          }
        ],
        // 角色描述规则
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      //   控制编辑角色对话框显示和隐藏
      editRoleDialogVisible: false,
      //   编辑角色表单
      editRoleForm: {},
      // 控制分配权限对话框显示和隐藏
      setRightsDialogVisible: false,
      // 所有权限列表对象
      rightList: [],
      // 树形列表结构属性绑定对象
      rightListProps: {
        label: 'authName',
        children: 'children'
      },
      // 角色拥有的权限数组，默认选中
      rightskey: [],
      // 当前打开分配权限对话框的角色对象
      setRightsDialogRole: null
    };
  },
  //   生命周期函数
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status + ' : 获取角色列表失败！');
      }
      this.rolesList = res.data;
      //   console.log(this.rolesList);
    },
    // 点击显示添加角色对话框
    showAddRoleDialog() {
      this.addRoleDialogVisible = true;
    },
    // 重置添加角色表单
    resetAddRoleForm() {
      this.$refs.addRoleFormRef.resetFields();
    },
    // 重置按钮点击事件
    resetFormBtn() {
      this.resetAddRoleForm();
    },
    // 提交添加角色请求
    addRoleBtn() {
      // 表单提交预验证
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return null;
        // 预验证通过，发起请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm);
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.status + ' : 添加角色失败！');
        }
        // 请求添加角色成功
        // 重新读取角色列表
        this.getRolesList();
        // 关闭对话框
        this.addRoleDialogVisible = false;
        //   返回成功提示
        return this.$message.success(res.meta.msg);
      });
    },
    // 删除角色
    async deleteRole(id) {
      // console.log(id);
      // 弹框提示用户是否确认删除角色
      const delConfirm = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);

      if (delConfirm !== 'confirm') return null;
      //   确认删除，发起请求
      const { data: res } = await this.$http.delete('roles/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status + ' : 删除角色失败！');
      }
      //   删除成功
      // 重新读取角色列表
      this.getRolesList();
      //   返回成功提示
      return this.$message.success(res.meta.msg);
    },
    // 点击显示编辑角色对话框
    async showEditRoleDialog(id) {
      // 发起查询角色信息请求
      const { data: res } = await this.$http.get('roles/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status + ' : 获取角色信息失败');
      }
      this.editRoleForm = res.data;
      this.editRoleDialogVisible = true;
    },
    // 重置编辑角色表单
    resetEditRoleForm() {
      this.$refs.editRoleFormRef.clearValidate();
    },
    // 角色编辑提交按钮事件
    editRoleBtn() {
      // 表单预验证
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return null;
        // 请求修改角色
        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.status + ' : 修改角色信息失败');
        }
        // 请求修改成功
        // 重新读取角色列表
        this.getRolesList();
        // 关闭对话框
        this.editRoleDialogVisible = false;
        // 返回成功提示
        return this.$message.success('角色信息修改成功！');
      });
    },
    // 删除角色权限
    async deleteRight(role, rightId) {
      // 弹出确认框
      const delRightConfirm = await this.$confirm(
        '此操作将删除此权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);
      // console.log(delRightConfirm);
      if (delRightConfirm !== 'confirm') return null;

      // 发起删除权限请求
      // console.log(role, rightId);
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status + ' : 权限删除失败！');
      }
      // 重新赋值权限层列表
      role.children = res.data;
      // 返回成功提示
      return this.$message.success(res.meta.msg);
    },
    // 显示分配权限对话框
    async showSetRightsDialog(role) {
      // 获取所有权限
      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status + ' : 获取权限列表失败！');
      }
      // 把获取到的权限列表保存到data中
      this.rightList = res.data;
      // console.log(this.rightList);
      // 调用获取角色所有三级权限的方法
      this.getRightId(role, this.rightskey);
      // 记录当前打开分配权限对话框的角色
      this.setRightsDialogRole = role;
      // 显示对话框
      this.setRightsDialogVisible = true;
    },
    // 获取角色拥有的所有三级权限的id
    getRightId(node, arr) {
      // console.log(node);
      // 判断是否为三级权限，有children属性的就不是
      if (!node.children) {
        return arr.push(node.id);
      }
      // 如果非三级权限，就递归调用
      node.children.forEach(item => {
        this.getRightId(item, arr);
      });
    },
    // 监听分配权限对话框关闭事件
    clearRightsKey() {
      // 清空 rightskey 数组
      this.rightskey = [];
    },
    // 给角色授权
    async updateRoleRights() {
      // 获取所有已选中和半选中的节点id
      const rightsKey = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const keysIdStr = rightsKey.join();
      // console.log(keysIdStr);
      const { data: res } = await this.$http.post(
        `roles/${this.setRightsDialogRole.id}/rights`,
        {
          rids: keysIdStr
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status + ' : 权限分配失败！');
      }
      // 请求处理成功
      // 成功提示
      this.$message.success('角色权限分配成功！');
      // 重新读取角色列表
      this.getRolesList();
      // 关闭对话框
      this.setRightsDialogVisible = false;
    }
  }
};
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.btop {
  border-top: 1px solid #eee;
}
.bbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
