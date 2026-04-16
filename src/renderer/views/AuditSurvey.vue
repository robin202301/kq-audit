<template>
  <div class="audit-survey">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Audit Survey</h2>
        <p class="text-gray-600 mt-1">Preliminary investigation and data collection</p>
      </div>
      <button class="px-4 py-2 bg-gov-navy-700 text-white rounded-lg hover:bg-gov-navy-800 transition-colors">
        Export to Word
      </button>
    </div>

    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div class="flex items-center">
        <svg class="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 class="font-medium text-yellow-800">Survey Stage - Under Development</h3>
          <p class="text-yellow-700 text-sm mt-1">This stage component is being developed. Check back soon for full functionality.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-6">
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-3">Data Collection</h3>
          <p class="text-gray-600 text-sm">Collect preliminary data and information about the audit subject.</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-3">Risk Assessment</h3>
          <p class="text-gray-600 text-sm">Identify and assess risks based on initial findings.</p>
        </div>
      </div>
      <div class="space-y-6">
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-3">Stakeholder Interviews</h3>
          <p class="text-gray-600 text-sm">Schedule and conduct interviews with key stakeholders.</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-3">Document Review</h3>
          <p class="text-gray-600 text-sm">Review existing documentation and records.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic will be implemented later
</script>

<style scoped>
.audit-survey {
  font-family: 'Inter', sans-serif;
}
</style>