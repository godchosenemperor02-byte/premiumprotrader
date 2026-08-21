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
  address: '',
  idFront: null,
  idBack: null
});

  // UI States
  let isLoading = $state(false);
  let isCheckingKyc = $state(true);
  let isKycCompleted = $state(false);
  let isSubmitted = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  // Fetch initial KYC state from user profile
  $effect(() => {
    async function checkKycStatus() {
      if (!supabase) {
        isCheckingKyc = false;
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('kyc')
          .eq('id', userId)
          .single();

        if (profile?.kyc === true) {
          isKycCompleted = true;
        }
      }

      isCheckingKyc = false;
    }

    checkKycStatus();
  });

function validateImage(file) {
  if (!file) return 'Please select an image.';

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (!allowedTypes.includes(file.type)) {
    return 'Please upload a JPG, PNG, or WebP image.';
  }

  if (file.size > 5 * 1024 * 1024) {
    return 'Each image must be smaller than 5MB.';
  }

  return null;
}
function handleIdFrontChange(e) {
  const file = e.target.files?.[0];

  const error = validateImage(file);

  if (error) {
    errorMessage = error;
    return;
  }

  kycForm.idFront = file;
  errorMessage = '';
}

function handleIdBackChange(e) {
  const file = e.target.files?.[0];

  const error = validateImage(file);

  if (error) {
    errorMessage = error;
    return;
  }

  kycForm.idBack = file;
  errorMessage = '';
}
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
        .from('profiles')
        .update({ kyc: true })
        .eq('id', userId); 

      if (error) {
        errorMessage = error.message;
        isLoading = false;
        return;
      }

      // Trigger success states
      successMessage = 'KYC successfully verified!';
      isKycCompleted = true;
      isSubmitted = true;
      isLoading = false;
      
    } else {
      errorMessage = 'Database connection missing.';
      isLoading = false;
    }
  }

async function handleKYCSubmit(e) {
  e.preventDefault();

  errorMessage = '';
  successMessage = '';

  if (
    !kycForm.fullName.trim() ||
    !kycForm.dob ||
    !kycForm.idNumber.trim() ||
    !kycForm.idFront
  ) {
    errorMessage = 'Please complete all required fields and upload your ID.';
    return;
  }

  const frontError = validateImage(kycForm.idFront);

  if (frontError) {
    errorMessage = frontError;
    return;
  }

  if (kycForm.idBack) {
    const backError = validateImage(kycForm.idBack);

    if (backError) {
      errorMessage = backError;
      return;
    }
  }

  isLoading = true;

  try {
    const { data: userData, error: authError } =
      await supabase.auth.getUser();

    const userId = userData?.user?.id;

    if (authError || !userId) {
      throw new Error('Unable to verify user session.');
    }

    /*
     * 1. Upload front image
     */

    const frontExtension =
      kycForm.idFront.name.split('.').pop()?.toLowerCase() || 'jpg';

    const frontPath =
      `${userId}/front-${crypto.randomUUID()}.${frontExtension}`;

    const { error: frontUploadError } =
      await supabase.storage
        .from('kyc-documents')
        .upload(frontPath, kycForm.idFront, {
          contentType: kycForm.idFront.type,
          upsert: false
        });

    if (frontUploadError) {
      throw new Error(
        `Failed to upload ID front: ${frontUploadError.message}`
      );
    }

    /*
     * 2. Upload back image if provided
     */

    let backPath = null;

    if (kycForm.idBack) {
      const backExtension =
        kycForm.idBack.name.split('.').pop()?.toLowerCase() || 'jpg';

      backPath =
        `${userId}/back-${crypto.randomUUID()}.${backExtension}`;

      const { error: backUploadError } =
        await supabase.storage
          .from('kyc-documents')
          .upload(backPath, kycForm.idBack, {
            contentType: kycForm.idBack.type,
            upsert: false
          });

      if (backUploadError) {
        // Clean up front upload if back upload fails
        await supabase.storage
          .from('kyc-documents')
          .remove([frontPath]);

        throw new Error(
          `Failed to upload ID back: ${backUploadError.message}`
        );
      }
    }

    /*
     * 3. Store KYC information
     */

    const { error: kycError } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: userId,
        full_name: kycForm.fullName.trim(),
        date_of_birth: kycForm.dob,
        id_type: kycForm.idType,
        id_number: kycForm.idNumber.trim(),
        residential_address: kycForm.address.trim() || null,
        id_front_path: frontPath,
        id_back_path: backPath,
        status: 'pending'
      });

    if (kycError) {
      // Clean up uploaded files if database insert fails
      const filesToRemove = [frontPath];

      if (backPath) {
        filesToRemove.push(backPath);
      }

      await supabase.storage
        .from('kyc-documents')
        .remove(filesToRemove);

      throw new Error(
        `Failed to save KYC details: ${kycError.message}`
      );
    }

    /*
     * 4. Success
     *
     * Notice that we DO NOT set profiles.kyc = true here.
     * The KYC is only submitted and is still pending review.
     */

    successMessage =
      'KYC documents submitted successfully. Your verification is pending review.';

    isSubmitted = true;

  } catch (error) {
    errorMessage =
      error?.message || 'Something went wrong while submitting your KYC.';
  } finally {
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

<!-- Top Alert Message -->
{#if successMessage}
  <div class="mb-6 p-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs rounded-xl max-w-2xl mx-auto flex items-center justify-between">
    <span>{successMessage}</span>
  </div>
{/if}

<div class="max-w-2xl mx-auto space-y-8">
  <!-- Header -->
  <div class="flex flex-col gap-1">
    <h2 class="text-2xl font-bold tracking-tight text-white">Identity Verification (KYC)</h2>
    <p class="text-sm text-gray-400">Complete identity verification to unlock full trading access and limits.</p>
  </div>

  {#if isCheckingKyc}
    <!-- LOADING INITIAL STATE -->
    <div class="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-center text-gray-400 text-sm">
      Checking verification status...
    </div>

  {:else if isKycCompleted}
    <!-- VERIFIED / COMPLETE VIEW -->
    <div class="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-8 text-center space-y-5 backdrop-blur-sm shadow-xl">
      <div class="w-16 h-16 rounded-full bg-blue-900/50 border border-blue-500/40 text-blue-400 mx-auto flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
      </div>

      <div class="space-y-2">
        <h3 class="text-xl font-bold text-white">KYC Verification Complete</h3>
        <p class="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
          Your identity has been fully verified. You have access to all trading features and maximum account limits.
        </p>
      </div>

      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Verified Account
      </div>
    </div>

  {:else if isSubmitted}
    <!-- JUST SUBMITTED STATE (OPTIONAL FALLBACK) -->
    <div class="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center space-y-5 backdrop-blur-sm shadow-xl">
      <div class="w-16 h-16 rounded-full bg-emerald-900/50 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>

      <div class="space-y-2">
        <h3 class="text-xl font-bold text-white">Verification Submitted!</h3>
        <p class="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
          Your KYC status has been updated. You are good to go!
        </p>
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
        <!-- ID Number -->
<div>
  <label
    class="block text-xs font-medium text-gray-400 mb-1.5"
    for="id-number"
  >
    Document / ID Number *
  </label>

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

<!-- ID Front -->
<div>
  <label
    class="block text-xs font-medium text-gray-400 mb-1.5"
    for="id-front"
  >
    ID Document — Front *
  </label>

  <input
    id="id-front"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onchange={handleIdFrontChange}
    disabled={isLoading}
    required
    class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-3 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-500 disabled:opacity-50"
  />

  {#if kycForm.idFront}
    <p class="mt-2 text-xs text-emerald-400">
      ✓ {kycForm.idFront.name}
    </p>
  {/if}
</div>

<!-- ID Back -->
<div>
  <label
    class="block text-xs font-medium text-gray-400 mb-1.5"
    for="id-back"
  >
    ID Document — Back
  </label>

  <input
    id="id-back"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onchange={handleIdBackChange}
    disabled={isLoading}
    class="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-3 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-500 disabled:opacity-50"
  />

  {#if kycForm.idBack}
    <p class="mt-2 text-xs text-emerald-400">
      ✓ {kycForm.idBack.name}
    </p>
  {/if}
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
