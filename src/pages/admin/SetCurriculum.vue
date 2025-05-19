<template>
  <div class="set-curriculum container">
    <!-- 查询表单 -->
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>管理员设置培养方案</h2>
          <p>为专业设置或编辑培养方案</p>
        </div>
      </template>

      <el-form :model="formData" label-width="120px" class="input-form" :rules="rules" ref="formRef">
        <el-form-item label="专业名称" prop="major_name" required>
          <el-input v-model="formData.major_name" placeholder="请输入专业名称" style="width: 100%;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryCurriculum" :loading="loading">
            查询培养方案
          </el-button>
          <el-button type="success" @click="saveCurriculum" :loading="saving" :disabled="!hasCurriculum">
            保存培养方案
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div v-if="hasCurriculum" class="curriculum-content">
      <!-- 培养方案模块设置 -->
      <el-card class="curriculum-card">
        <template #header>
          <div class="card-header">
            <h3>培养方案模块设置</h3>
          </div>
        </template>

        <div v-for="(section, index) in formData.sections" :key="index" class="section-item">
          <el-divider v-if="index > 0" />

          <div class="section-header">
            <el-input v-model="section.section_name" placeholder="模块名称（如：必修课、选修课）"
              style="width: 200px; margin-right: 20px;" />
            <el-input-number v-model="section.section_credit" :min="0" controls-position="right" placeholder="模块学分要求"
              style="width: 180px;">
              <template #prepend>要求学分:</template>
            </el-input-number>

            <div class="credit-status">
              <span :class="{ 'credit-warning': !isSectionCreditEnough(section) }">
                当前学分: {{ calculateSectionCredit(section) }}
              </span>
            </div>

            <el-button type="danger" @click="removeSection(index)" icon="Delete" circle style="margin-left: 10px;" />
          </div>

          <div class="section-courses" v-if="section.course_list.length > 0">
            <el-table :data="section.course_list" style="width: 100%" border>
              <el-table-column prop="course_name" label="课程名称" />
              <el-table-column prop="credit" label="学分" width="120" />
              <el-table-column label="操作" width="120" align="center">
                <template #default="scope">
                  <el-button type="danger" size="small" @click="removeCourseFromSection(section, scope.$index)">
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="该模块暂无课程" />
        </div>

        <div class="add-section-container">
          <el-button type="primary" @click="addSection" icon="Plus">添加模块</el-button>
        </div>
      </el-card>

      <!-- 当前培养方案课程 -->
      <el-card class="curriculum-card">
        <template #header>
          <div class="card-header">
            <h3>已添加到培养方案的课程</h3>
          </div>
        </template>

        <el-table :data="addedCourses" style="width: 100%" border v-loading="loading">
          <el-table-column prop="course_id" label="课程ID" width="120" />
          <el-table-column prop="course_name" label="课程名称" />
          <el-table-column prop="credit" label="学分" width="100" />
          <el-table-column prop="teacher_name" label="授课教师" width="120" />
          <el-table-column prop="sectionName" label="所属模块" width="120" />
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button type="danger" size="small" @click="removeCourseFromCurriculum(scope.row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="addedCourses.length === 0" description="暂无已添加课程" />
      </el-card>

      <!-- 可添加课程 -->
      <el-card class="curriculum-card">
        <template #header>
          <div class="card-header">
            <h3>可添加课程</h3>
            <div class="search-form">
              <el-input v-model="searchKeyword" placeholder="输入课程名称或ID搜索" style="width: 300px; margin-right: 10px;"
                clearable @keyup.enter="filterAvailableCourses" />
              <el-button type="primary" @click="filterAvailableCourses">
                筛选课程
              </el-button>
            </div>
          </div>
        </template>

        <el-table :data="filteredAvailableCourses" style="width: 100%" border>
          <el-table-column prop="course_id" label="课程ID" width="120" />
          <el-table-column prop="course_name" label="课程名称" />
          <el-table-column prop="credit" label="学分" width="100" />
          <el-table-column prop="teacher_name" label="授课教师" width="120" />
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" @click="showAddCourseDialog(scope.row)">
                添加
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="filteredAvailableCourses.length === 0" description="暂无可添加课程" />

        <div class="pagination-container" v-if="filteredAvailableCourses.length > 0">
          <el-pagination background layout="prev, pager, next" :total="totalAvailableCourses" :page-size="pageSize"
            :current-page="currentPage" @current-change="handlePageChange" />
        </div>
      </el-card>
    </div>

    <!-- 添加课程到模块对话框 -->
    <el-dialog v-model="showSelectSectionDialog" title="选择添加到模块" width="30%">
      <el-form>
        <el-form-item label="选择模块">
          <el-select v-model="selectedSectionForCourse" placeholder="请选择模块" style="width: 100%">
            <el-option v-for="section in formData.sections" :key="section.section_name" :label="section.section_name"
              :value="section.section_name" :disabled="!section.section_name" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSelectSectionDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAddCourseToSection">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { adminAPI, searchCourse } from '../../api/admin';
import { all } from 'axios';

// 表单校验规则
const rules = {
  major_name: [
    { required: true, message: '请输入专业名称', trigger: 'blur' },
    { min: 2, message: '专业名称至少需要2个字符', trigger: 'blur' }
  ]
};

// 表单引用
const formRef = ref(null);

// 状态变量
const loading = ref(false);
const saving = ref(false);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const hasCurriculum = ref(false);

// 课程选择对话框相关
const showSelectSectionDialog = ref(false);
const selectedSectionForCourse = ref('');
const currentSelectingCourse = ref(null);

// 所有课程数据源(从后端一次性获取)
const allCourses = ref([]);

// 表单数据
const formData = reactive({
  major_name: '',
  sections: []
});

// 计算属性: 已添加到培养方案的课程
const addedCourses = computed(() => {
  const courses = [];

  formData.sections.forEach(section => {
    section.course_list.forEach(course => {
      // 查找完整课程信息
      const fullCourse = allCourses.value.find(c => c.course_name === course.course_name);
      if (fullCourse) {
        courses.push({
          ...fullCourse,
          sectionName: section.section_name
        });
      }
    });
  });
  return courses;
});

// 计算属性: 可添加的课程(排除已添加的)
const availableCourses = computed(() => {
  // 获取已添加课程的ID列表
  const addedCourseIds = addedCourses.value.map(course => course.course_id);

  // 过滤出未添加的课程
  return allCourses.value.filter(course => !addedCourseIds.includes(course.course_id));
});

// 计算属性: 经过搜索筛选的可添加课程
const filteredAvailableCourses = computed(() => {
  if (!searchKeyword.value) {
    return availableCourses.value;
  }

  const keyword = searchKeyword.value.toLowerCase();
  return availableCourses.value.filter(course =>
    course.course_name.toLowerCase().includes(keyword) ||
    course.course_id.toString().includes(keyword)
  );
});

// 计算属性: 可添加课程总数
const totalAvailableCourses = computed(() => filteredAvailableCourses.value.length);

// 查询专业培养方案
const queryCurriculum = async () => {
  if (!formData.major_name) {
    ElMessage.warning('请先输入专业名称');
    return;
  }

  try {
    loading.value = true;

    // 获取专业培养方案
    const curriculumResponse = await adminAPI.getCurriculum(formData.major_name);

    const coursesResponse = await searchCourse({need_available: true});

    if (curriculumResponse.code === '200' && coursesResponse.code === '200') {
      // 更新培养方案数据
      formData.sections = curriculumResponse.data.sections;
      console.log('培养方案sections数据:', formData.sections);
      // 更新所有课程数据
      allCourses.value = coursesResponse.data.course_list;
      console.log('所有课程数据:', allCourses.value);

      /*allCourses.value的结构
      [{
        course_id: number;
        course_name: string;
        course_description?: string;
        teacher_name: string;
        credit: number;
        class_time: string;
        classroom: string;
        available_capacity?: number;
        total_capacity?: number;
      }]
      */
      // 初始化已添加的课程的完整信息
      updateCoursesInSections();

      hasCurriculum.value = true;
      ElMessage.success('培养方案加载成功');
    } else {
      const errorMsg = curriculumResponse.code !== '200'
        ? curriculumResponse.message
        : coursesResponse.message;
      ElMessage.error(`获取数据失败: ${errorMsg}`);
    }
  } catch (error) {
    console.error('查询失败:', error);
    ElMessage.error('查询培养方案失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 更新模块中课程的完整信息，保证前端模块的课程的学分信息始终和总课程表同步
const updateCoursesInSections = () => {
  formData.sections.forEach(section => {
    section.course_list.forEach((course, index) => {
      const fullCourse = allCourses.value.find(c => c.course_name === course.course_name);
      if (fullCourse) {
        // 更新学分信息，确保与完整课程信息一致
        section.course_list[index].credit = fullCourse.credit;
      }
    });
  });
};

// 筛选可用课程
const filterAvailableCourses = () => {
  currentPage.value = 1;
  // 不需要额外操作，依赖computed属性自动更新
};

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 显示添加课程对话框
const showAddCourseDialog = (course) => {
  if (formData.sections.length === 0) {
    ElMessage.warning('请先添加至少一个模块');
    return;
  }

  // 检查是否有可用模块(有名称的模块)
  const availableSections = formData.sections.filter(s => s.section_name);
  if (availableSections.length === 0) {
    ElMessage.warning('请先为模块设置名称');
    return;
  }

  currentSelectingCourse.value = course;
  selectedSectionForCourse.value = formData.sections[0].section_name;
  showSelectSectionDialog.value = true;
};

// 确认添加课程到指定模块
const confirmAddCourseToSection = () => {
  if (!selectedSectionForCourse.value) {
    ElMessage.warning('请选择一个模块');
    return;
  }

  const course = currentSelectingCourse.value;
  const section = formData.sections.find(s => s.section_name === selectedSectionForCourse.value);

  if (section && course) {
    // 添加到指定模块
    section.course_list.push({
      course_name: course.course_name,
      credit: course.credit
    });

    ElMessage.success(`已添加课程: ${course.course_name} 到模块: ${section.section_name}`);
  }

  showSelectSectionDialog.value = false;
};

// 从培养方案中移除课程
const removeCourseFromCurriculum = (course) => {
  // 从所有模块中移除该课程
  formData.sections.forEach(section => {
    const courseIndex = section.course_list.findIndex(c => c.course_name === course.course_name);
    if (courseIndex !== -1) {
      section.course_list.splice(courseIndex, 1);
    }
  });

  ElMessage.success(`已从培养方案中移除课程: ${course.course_name}`);
};

// 从指定模块中移除课程
const removeCourseFromSection = (section, courseIndex) => {
  const courseName = section.course_list[courseIndex].course_name;
  section.course_list.splice(courseIndex, 1);

  // 检查该课程是否还在其他模块中
  const stillExists = formData.sections.some(s =>
    s.course_list.some(c => c.course_name === courseName)
  );

  if (!stillExists) {
    ElMessage.success(`已从培养方案中移除课程: ${courseName}`);
  } else {
    ElMessage.success(`已从${section.section_name}模块移除课程: ${courseName}`);
  }
};

// 添加新模块
const addSection = () => {
  formData.sections.push({
    section_name: '',
    section_credit: 0,
    course_list: []
  });
};

// 移除模块
const removeSection = (sectionIndex) => {
  const section = formData.sections[sectionIndex];

  // 如果模块中有课程，提示确认
  if (section.course_list.length > 0) {
    ElMessageBox.confirm(`该模块包含 ${section.course_list.length} 门课程，确定要删除吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      executeRemoveSection(sectionIndex);
    }).catch(() => { });
  } else {
    executeRemoveSection(sectionIndex);
  }
};

// 执行移除模块
const executeRemoveSection = (sectionIndex) => {
  formData.sections.splice(sectionIndex, 1);
  ElMessage.success('模块已删除');
};

// 计算模块当前总学分
const calculateSectionCredit = (section) => {
  return section.course_list.reduce((total, course) => total + Number(course.credit), 0);
};

// 检查模块学分是否达标
const isSectionCreditEnough = (section) => {
  return calculateSectionCredit(section) >= section.section_credit;
};

// 检查所有模块学分是否达标
const checkAllSectionsCredit = () => {
  const invalidSections = formData.sections.filter(section =>
    section.section_name && !isSectionCreditEnough(section)
  );

  if (invalidSections.length > 0) {
    const sectionNames = invalidSections.map(s => `"${s.section_name}"`).join(', ');
    ElMessage.warning(`以下模块学分未达到要求: ${sectionNames}`);
    return false;
  }

  return true;
};

// 保存培养方案
const saveCurriculum = async () => {
  if (!formData.major_name) {
    ElMessage.warning('请输入专业名称');
    return;
  }

  // 验证每个模块是否有名称
  for (const section of formData.sections) {
    if (!section.section_name) {
      ElMessage.warning('请为所有模块填写名称');
      return;
    }
  }

  // 检查模块学分是否达标
  if (!checkAllSectionsCredit()) {
    return;
  }

  try {
    saving.value = true;

    // 真实API请求
    const response = await adminAPI.setCurriculum(formData);

    if (response.code === '200') {
      ElMessage.success('培养方案保存成功');
    } else {
      ElMessage.error(`保存失败: ${response.message}`);
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存培养方案失败: ' + (error.message || '未知错误'));
  } finally {
    saving.value = false;
  }
};

// 初始化
onMounted(() => {
  // 在真实环境中可能需要预加载一些数据
});
</script>

<style scoped>
.set-curriculum {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card,
.curriculum-card {
  margin-bottom: 20px;
}

.curriculum-content {
  margin-top: 20px;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-header h2,
.card-header h3 {
  margin-bottom: 10px;
}

.card-header p {
  margin-top: 0;
  color: #666;
}

.input-form {
  max-width: 600px;
  margin: 0 auto;
}

.search-form {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.section-item {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.credit-status {
  margin-left: 20px;
  font-size: 14px;
}

.credit-warning {
  color: #f56c6c;
  font-weight: bold;
}

.section-courses {
  margin-top: 10px;
}

.add-section-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
