<template>
  <div>
    <!-- 面包屑导航区域 -->
    <bread-crumb>
      <span slot="manage">商品管理</span>
      <span slot="list">商品分类</span>
    </bread-crumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
            props.checkStrictly
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
        <!-- 分类编辑对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="editCateDialogClosed"
    >
      <!-- 编辑分类对话框表单区域 -->
      <!-- 对话框表单区域 -->
      <el-form
        :model="editCateForm"
        :rules="addCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <!-- 分类名称 -->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name" clearable></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import BreadCrumb from "../common/BreadCrumb";

export default {
  components: { BreadCrumb },
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "isok",
        },
        {
          label: "排序",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "order",
        },
        {
          label: "操作",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "opt",
        },
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: "",
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的时1级分类
        cat_level: 0,
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 控制编辑分类对话框显示与隐藏
      editCateDialogVisible: false,
      // 编辑对话框分类表单对象
      editCateForm: {}
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo,
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }

      console.log(res.data);
      // 把数据列表，赋值给catelist
      this.catelist = res.data.result;
      // 为总数居条数赋值
      this.total = res.data.total;
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.querInfo.pagesize = newPage;
      this.getCateList();
    },
    // 点击按钮，展示添加分类对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList();
      // 再展示出对话框
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取父级类数据失败");
      }

      console.log(res.data);
      this.parentCateList = res.data;
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys);
      // 如果selectedKeys数组中的length大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0;
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );

        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败！");
        }

        this.$message.success("添加分类成功！");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 点击显示编辑分类对话框
    showEditCateDialog(cate) {
      // console.log(cate);
      // 把当前编辑行的数据保存到data中
      this.editCateForm = cate;
      this.editCateDialogVisible = true;
    },
    // 点击确认提交编辑分类
    editCateBtn() {
      // 表单预验证
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return null;
        // console.log(this.editCateForm);
        const { data: res } = await this.$http.put(
          `categories/${this.editCateForm.cat_id}`,
          {
            cat_name: this.editCateForm.cat_name
          }
        );

        if (res.meta.status !== 200) {
          console.log(res);
          return this.$message.error(res.meta.status + ' : 更新分类失败！');
        }
        // 更新分类成功
        this.$message.success('更新分类成功！');
        // 重新读取分类列表
        this.getCateList();
        // 关闭对话框
        this.editCateDialogVisible = false;
      });
    },
    // 监听编辑分类对话框关闭事件
    editCateDialogClosed() {
      // 清空表单校验规则
      this.$refs.editCateFormRef.clearValidate();
      // 清空editCateForm
      this.editCateForm = {};
    },
    // 删除分类
    async deleteCate(id) {
      // 弹出确认框
      const delConfirm = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);
      if (delConfirm !== 'confirm') return null;
      // console.log(id, delConfirm);
      const { data: res } = await this.$http.delete('categories/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status + ' : 删除分类失败！');
      }
      this.$message.success('删除分类成功！');
      // 重新读取分类列表
      this.getCateList();
    }
  },
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>