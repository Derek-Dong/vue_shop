<template>
  <div>
    <!-- 面包屑导航区域 -->
    <bread-crumb>
      <span slot="manage">商品管理</span>
      <span slot="list">商品列表</span>
    </bread-crumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="95px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="70px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editGoods(scope.row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
    <!-- 编辑商品信息对话框 -->
    <el-dialog
      title="修改商品信息"
      :visible.sync="editDialogVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="editDialogClosed"
    >
      <!-- 修改商品表单区域 -->
      <el-form :model="GoodsById" :rules="GoodsByIdRuls" ref="GoodsByIdRef" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="GoodsById.goods_name" clearable></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input type="number" v-model.number="GoodsById.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input type="number" v-model.number="GoodsById.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input type="number" v-model.number="GoodsById.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogBtn">确 定</el-button>
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
      // 查询参数对象
      queryInfo: {
        query: "",
        // 当前页面
        pagenum: 1,
        // 当前页面显示多少条数据
        pagesize: 10,
      },
      // 商品列表
      goodslist: [],
      // 总数据条数
      total: 0,
      // 根据商品ID获取商品信息
      GoodsById: {},
      // 控制编辑商品信息对话框显示与隐藏
      editDialogVisible: false,
      // 编辑商品信息校验规则
      GoodsByIdRuls: {
        goods_name: [
          { required: true, message: '请填写商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败！");
      }

      this.$message.success("获取商品列表成功！");
      console.log(res.data);
      this.goodslist = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    async removeById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品，是否继续？",
        "提示",
        {
          confirmBottonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }

      const { data: res } = await this.$http.delete(`goods/${id}`);

      if (res.meta.status !== 200) {
        return this.$message.error("删除失败！");
      }

      this.$message.success("删除成功！");
      this.getGoodsList();
    },
    goAddpage() {
      this.$router.push("/goods/add");
    },
    // 编辑商品按钮
    async editGoods(id) {
      const { data: res } = await this.$http.get(`goods/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status + ' : 获取商品信息失败！');
      }
      // console.log(res);
      this.GoodsById = res.data;
      // console.log(this.GoodsById);
      this.editDialogVisible = true;
    },
    // 编辑商品对话框关闭
    editDialogClosed() {
      this.$refs.GoodsByIdRef.clearValidate();
      this.GoodsById = {};
    },
    // 提交表单修改信息
    editDialogBtn() {
      // 表单预验证
      this.$refs.GoodsByIdRef.validate(async valid => {
        if (!valid) return null;
        // 验证通过，发起修改请求
        const editForm = {};
        editForm.goods_name = this.GoodsById.goods_name;
        editForm.goods_price = this.GoodsById.goods_price;
        editForm.goods_number = this.GoodsById.goods_number;
        editForm.goods_weight = this.GoodsById.goods_weight;
        editForm.goods_cat = this.GoodsById.goods_cat;
        // console.log(editForm);
        const { data: res } = await this.$http.put(
          `goods/${this.GoodsById.goods_id}`,
          editForm
        );
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.status + ' : 修改商品信息失败！');
        }
        // console.log(res);
        // 修改成功
        this.$message.success('修改商品信息成功！');
        // 重新读取商品信息列表
        this.getGoodsList();
        // 关闭对话框
        this.editDialogVisible = false;
      });
    }
  },
};
</script>

<style lang="less" scoped >
</style>