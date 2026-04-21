<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- 头部 -->
    <header class="bg-gov-navy text-white shadow-lg">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h1 class="text-2xl font-bold">审计系统-Win</h1>
            </div>
            <span class="px-3 py-1 text-xs font-semibold rounded-full bg-white/20">
              离线模式
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <button class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              新建审计
            </button>
            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition">
                <span class="text-white font-semibold">AU</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1">
      <!-- 侧边栏 - 6个审计阶段 -->
      <aside class="w-64 bg-gov-navy-900 text-white shadow-xl">
        <div class="p-4 border-b border-gov-navy-800">
          <h2 class="text-lg font-semibold">审计工作流</h2>
          <p class="text-sm text-gray-300 mt-1">6阶段流程</p>
        </div>

        <nav class="p-2">
          <div
            v-for="stage in auditStages"
            :key="stage.id"
            @click="selectStage(stage)"
            class="mb-1"
          >
            <div
              class="flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200"
              :class="{
                'bg-gov-navy-700 text-white shadow-md': currentStage?.id === stage.id,
                'hover:bg-gov-navy-800 text-gray-200': currentStage?.id !== stage.id
              }"
            >
              <!-- 阶段编号徽章 -->
              <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3"
                :class="currentStage?.id === stage.id ? 'bg-gov-accent-gold text-gov-navy-900' : 'bg-gov-navy-700 text-gray-300'">
                <span class="text-sm font-bold">{{ stage.order_index }}</span>
              </div>

              <!-- 阶段信息 -->
              <div class="flex-1">
                <div class="font-medium">{{ stage.name }}</div>
                <div class="text-xs mt-0.5 opacity-75">{{ stage.description }}</div>
              </div>

              <!-- 激活指示器 -->
              <div v-if="currentStage?.id === stage.id" class="ml-2">
                <div class="w-2 h-2 rounded-full bg-gov-accent-gold"></div>
              </div>
            </div>
          </div>
        </nav>

        <!-- 统计摘要 -->
        <div class="p-4 border-t border-gov-navy-800 mt-4">
          <h3 class="text-sm font-medium text-gray-300 mb-2">项目状态</h3>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">进行中的审计</span>
              <span class="text-white font-medium">12</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">已完成</span>
              <span class="text-white font-medium">48</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">本月</span>
              <span class="text-white font-medium">3</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="flex-1 p-6 overflow-auto">
        <div class="max-w-6xl mx-auto">
          <!-- 阶段标题 -->
          <div v-if="currentStage" class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-lg bg-gov-navy-100 text-gov-navy-700 flex items-center justify-center mr-3">
                    <span class="text-lg font-bold">{{ currentStage.order_index }}</span>
                  </div>
                  <div>
                    <h2 class="text-3xl font-bold text-gray-900">{{ currentStage.name }}</h2>
                    <p class="text-gray-600 mt-1">{{ currentStage.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Stage progress indicator -->
              <div class="flex items-center space-x-4">
                <div class="text-right">
                  <div class="text-sm text-gray-500">阶段进度</div>
                  <div class="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-gov-navy rounded-full" :style="{ width: '75%' }"></div>
                  </div>
                </div>
                <button class="px-4 py-2 bg-gov-navy text-white rounded-lg hover:bg-gov-navy-700 transition flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  导出阶段
                </button>
              </div>
            </div>
          </div>

          <!-- Stage content -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div v-if="currentStage">
              <!-- 动态阶段组件 -->
              <component :is="stageComponent" :projectId="currentProjectId" :key="currentStage?.id" />
            </div>
            <div v-else class="text-center py-12">
              <div class="w-24 h-24 mx-auto mb-6 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">欢迎使用审计系统-Win</h3>
              <p class="text-gray-500 max-w-md mx-auto">
                从侧边栏选择一个审计阶段开始。6阶段工作流将指导您完成从通知到最终报告的完整审计流程。
              </p>
              <button
                @click="selectFirstStage"
                class="mt-6 px-6 py-3 bg-gov-navy text-white rounded-lg hover:bg-gov-navy-700 transition font-medium"
              >
                从通知阶段开始
              </button>
            </div>
          </div>

          <!-- Footer note -->
          <div class="mt-6 text-center text-sm text-gray-500">
            <p>所有数据均存储在本地SQLite数据库中。离线工作，安全可靠。</p>
          </div>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t py-3 px-6">
      <div class="flex justify-between items-center text-sm text-gray-500">
        <div class="flex items-center">
          <div class="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span>数据库：已连接</span>
        </div>
        <div>审计系统-Win v0.1.0 • © 2024 政府审计机构</div>
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          最后同步：刚刚
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, shallowRef } from 'vue'
import { AuditStage } from '@shared/types'
import AuditNotice from './views/AuditNotice.vue'
import AuditSurvey from './views/AuditSurvey.vue'
import AuditPlan from './views/AuditPlan.vue'
import AuditEvidence from './views/AuditEvidence.vue'
import AuditWorkingPaper from './views/AuditWorkingPaper.vue'
import AuditFinalReport from './views/AuditFinalReport.vue'

// Mock data for now - replace with actual API calls
const auditStages = shallowRef<AuditStage[]>([
  { id: 1, name: '通知', description: '初始审计通知和范围定义', order_index: 1, created_at: '' },
  { id: 2, name: '调查', description: '初步调查和数据收集', order_index: 2, created_at: '' },
  { id: 3, name: '计划', description: '审计计划制定和资源分配', order_index: 3, created_at: '' },
  { id: 4, name: '证据', description: '证据收集与文档化', order_index: 4, created_at: '' },
  { id: 5, name: '工作底稿', description: '分析和工作底稿准备', order_index: 5, created_at: '' },
  { id: 6, name: '最终报告', description: '报告生成和签署', order_index: 6, created_at: '' }
])

const currentStage = ref<AuditStage | null>(null)
const currentProjectId = ref<number | null>(1) // TODO: Get from project selection

// Stage component mapping
const stageComponents: Record<string, any> = {
  '通知': AuditNotice,
  '调查': AuditSurvey,
  '计划': AuditPlan,
  '证据': AuditEvidence,
  '工作底稿': AuditWorkingPaper,
  '最终报告': AuditFinalReport
}

function selectStage(stage: AuditStage) {
  currentStage.value = stage
}

function selectFirstStage() {
  if (auditStages.value.length > 0) {
    currentStage.value = auditStages.value[0]
  }
}

function getStageStats(stageId: number): number {
  // Mock stats - replace with actual counts from database
  return Math.floor(Math.random() * 10)
}

const stageComponent = computed(() => {
  if (!currentStage.value) return null

  // Return the appropriate component based on stage name
  const component = stageComponents[currentStage.value.name]
  if (component) {
    return component
  }

  // Fallback placeholder
  return {
    template: '<div class="p-8 text-center text-gray-500">Stage component for ' + currentStage.value.name + ' is under development.</div>'
  }
})

onMounted(async () => {
  // Load audit stages from database via Electron API
  if (window.electronAPI) {
    try {
      const stages = await window.electronAPI.getAuditStages()
      if (stages && stages.length) {
        auditStages.value = stages
      }
    } catch (error) {
      console.error('Failed to load audit stages:', error)
    }
  }

  // Auto-select first stage on initial load
  selectFirstStage()
})
</script>

<style>
/* Global styles if needed */
</style>