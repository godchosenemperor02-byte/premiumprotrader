<script>
  // Svelte 5 Runes Props & Safe Supabase Access
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // Form State
  let kycForm = $state({
    fullName: '',
    dob: '',
    idType: 'passport',
    idNumber: '',
    address: ''
  });

  // UI States
  let isLoading = $state(false);
  let isSubmitted = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  async function handleKYCSubmit(e) {
    e.preventDefault();

    if (!kycForm.fullName.trim() || !kycForm.idNumber.trim()) {
      errorMessage = 'Please complete all required fields.';
      return;
    }

    isLoading = true;
    errorMessage = '';
    successMessage = '';

    if (supabase) {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (authError || !userId) {
        errorMessage = 'Unable to verify user session.';
        isLoading = false;
        return;
      }

      // Update the kyc status in the profile table to true
      const { error } = await supabase
        .from('profile')
        .update({ kyc: true })
        .eq('id', userId); 

      if (error) {
        errorMessage = error.message;
        isLoading = false;
        return;
      }

      // Trigger success states
      successMessage = 'KYC successfully verified!';
      isSubmitted = true;
      isLoading = false;
      
    } else {
      errorMessage = 'Database connection missing.';
      isLoading = false;
    }
  }

  function resetForm() {
    kycForm = {
      fullName: '',
      dob: '',
      idType: 'passport',
      idNumber: '',
      address: ''
    };
    isSubmitted = false;
    errorMessage = '';
    successMessage = '';
  }
</script>

<!-- Example Success Message Rendering -->
{#if successMessage}
  <div class="success-alert">
    {successMessage}
  </div>
{/if}

<div class="max-w-2xl mx-auto space-y-8">
  <!-- Header -->
  <div class="flex flex-col gap-1">
    <h2 class="text-2xl font-bold tracking-tight text-white">Identity Verification (KYC)</h2>
    <p class="text-sm text-gray-400">Complete identity verification to unlock full trading access and limits.</p>
  </div>

  {#if isSubmitted}
    <!-- SUCCESS MESSAGE VIEW -->
    <div class="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center space-y-5 backdrop-blur-sm shadow-xl">
      <div class="w-16 h-16 rounded-full bg-emerald-900/50 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>

      <div class="space-y-2">
        <h3 class="text-xl font-bold text-white">Verification Submitted!</h3>
        <p class="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
          Your KYC details have been successfully received and are under review. Our team will verify your information shortly.
        </p>
      </div>

      <div class="pt-2">
        <button 
          onclick={resetForm}
          class="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-semibold transition-all"
        >
          Submit Another Document
        </button>
      </div>
    </div>
  {:else}
    <!-- FORM VIEW -->
    <form onsubmit={handleKYCSubmit} class="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
      {#if errorMessage}
        <div class="p-3.5 bg-red-950/80 border border-red-900/50 text-red-400 text-xs rounded-xl">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-4">
        <!-- Full Name -->
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1.5" for="full-name">Legal Full Name *</label>
          <input 
            id="full-name"
            type="text" 
            placeholder="e.g. John Alexander Doe"
            bind:value={kycForm.fullName} 
            disabled={isLoading}
            required
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Date of Birth -->
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1.5" for="dob">Date of Birth *</label>
            <input 
              id="dob"
              type="date" 
              bind:value={kycForm.dob} 
              disabled={isLoading}
              required
              class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <!-- Document Type -->
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1.5" for="id-type">ID Type *</label>
            <select
              id="id-type"
              bind:value={kycForm.idType}
              disabled={isLoading}
              class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="passport">International Passport</option>
              <option value="national_id">National Identity Card</option>
              <option value="drivers_license">Driver's License</option>
            </select>
          </div>
        </div>

        <!-- ID Number -->
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1.5" for="id-number">Document / ID Number *</label>
          <input 
            id="id-number"
            type="text" 
            placeholder="e.g. A12345678"
            bind:value={kycForm.idNumber} 
            disabled={isLoading}
            required
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <!-- Address -->
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1.5" for="address">Residential Address</label>
          <textarea 
            id="address"
            rows="3"
            placeholder="Street address, City, State/Province, Country"
            bind:value={kycForm.address} 
            disabled={isLoading}
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="pt-2 border-t border-gray-800 flex justify-end">
        <button 
          type="submit"
          disabled={isLoading}
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-950/50 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isLoading}
            <span>Submitting Details...</span>
          {:else}
            <span>Submit Verification</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          {/if}
        </button>
      </div>
    </form>
  {/if}
</div>
