<template>
  <div class="audit-plan">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Audit Plan</h2>
        <p class="text-gray-600 mt-1">Audit plan development and resource allocation</p>
      </div>
      <button class="px-4 py-2 bg-gov-navy-700 text-white rounded-lg hover:bg-gov-navy-800 transition-colors">
        Export to Word
      </button>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div class="flex items-center">
        <svg class="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
        <div>
          <h3 class="font-medium text-blue-800">Plan Stage - Under Development</h3>
          <p class="text-blue-700 text-sm mt-1">This stage component is being developed. Check back soon for full functionality.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-6">
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-3">Audit Objectives</h3>
          <p class="text-gray-600 text-sm">Define clear and measurable audit objectives.</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-3">Scope Definition</h3>
          <p class="text-gray-600 text-sm">Clearly define the boundaries of the audit.</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-3">Methodology</h3>
          <p class="text-gray-600 text-sm">Select appropriate audit procedures and methods.</p>
        </div>
      </div>
      <div class="space-y-6">
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-3">Resource Allocation</h3>
          <p class="text-gray-600 text-sm">Assign team members and allocate resources.</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-3">Timeline</h3>
          <p class="text-gray-600 text-sm">Develop detailed schedule with milestones.</p>
        </div>
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-3">Risk Management</h3>
          <p class="text-gray-600 text-sm">Plan for risk mitigation and contingency.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic will be implemented later
</script>

<style scoped>
.audit-plan {
  font-family: 'Inter', sans-serif;
}
</style>