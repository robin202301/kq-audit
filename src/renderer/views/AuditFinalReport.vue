<template>
  <div class="audit-final-report">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Final Report</h2>
        <p class="text-gray-600 mt-1">Report generation and sign-off</p>
      </div>
      <button class="px-4 py-2 bg-gov-navy-700 text-white rounded-lg hover:bg-gov-navy-800 transition-colors">
        Export to Word
      </button>
    </div>

    <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div class="flex items-center">
        <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
        <div>
          <h3 class="font-medium text-red-800">Final Report Stage - Under Development</h3>
          <p class="text-red-700 text-sm mt-1">This stage component is being developed. Check back soon for full functionality.</p>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h3 class="text-lg font-medium text-gray-800 mb-4">Report Components</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="border border-gray-200 rounded-lg p-5 text-center">
          <div class="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h4 class="font-medium text-gray-900 mb-2">Executive Summary</h4>
          <p class="text-gray-600 text-sm">High-level overview of audit findings and recommendations.</p>
        </div>

        <div class="border border-gray-200 rounded-lg p-5 text-center">
          <div class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <h4 class="font-medium text-gray-900 mb-2">Detailed Findings</h4>
          <p class="text-gray-600 text-sm">Comprehensive documentation of audit findings with evidence.</p>
        </div>

        <div class="border border-gray-200 rounded-lg p-5 text-center">
          <div class="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h4 class="font-medium text-gray-900 mb-2">Recommendations</h4>
          <p class="text-gray-600 text-sm">Actionable recommendations with implementation guidance.</p>
        </div>
      </div>
    </div>

    <div class="border border-gray-200 rounded-lg p-6">
      <h3 class="font-medium text-gray-800 mb-4">Report Generation Workflow</h3>
      <div class="space-y-4">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-gov-navy text-white flex items-center justify-center mr-4 flex-shrink-0">1</div>
          <div>
            <h4 class="font-medium text-gray-900">Compile Working Papers</h4>
            <p class="text-gray-600 text-sm">Gather all working papers and supporting documentation.</p>
          </div>
        </div>
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-gov-navy text-white flex items-center justify-center mr-4 flex-shrink-0">2</div>
          <div>
            <h4 class="font-medium text-gray-900">Draft Report</h4>
            <p class="text-gray-600 text-sm">Create initial draft using standardized templates.</p>
          </div>
        </div>
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-gov-navy text-white flex items-center justify-center mr-4 flex-shrink-0">3</div>
          <div>
            <h4 class="font-medium text-gray-900">Review & Approval</h4>
            <p class="text-gray-600 text-sm">Internal review and management approval process.</p>
          </div>
        </div>
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-gov-navy text-white flex items-center justify-center mr-4 flex-shrink-0">4</div>
          <div>
            <h4 class="font-medium text-gray-900">Final Distribution</h4>
            <p class="text-gray-600 text-sm">Distribute final report to stakeholders.</p>
          </div>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-200 text-center">
        <p class="text-gray-600 text-sm">Final report generation will integrate with the Word document service to produce professional audit reports.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic will be implemented later
</script>

<style scoped>
.audit-final-report {
  font-family: 'Inter', sans-serif;
}
</style>