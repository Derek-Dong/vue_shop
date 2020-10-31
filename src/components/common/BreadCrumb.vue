<template>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>
      <slot name="manage"></slot>
    </el-breadcrumb-item>
    <el-breadcrumb-item>
      <slot name="list"></slot>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: "BreadCrumb",
};
</script>

<style>
</style>