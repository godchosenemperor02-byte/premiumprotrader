<script>
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // -----------------------------------------
  // State
  // -----------------------------------------

  let kycRecords = $state([]);
  let selectedKyc = $state(null);

  let isLoading = $state(true);
  let isReviewLoading = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  let activeFilter = $state('pending');
  let searchQuery = $state('');

  let frontImageUrl = $state('');
  let backImageUrl = $state('');

  // -----------------------------------------
  // Load KYC records
  // -----------------------------------------

  async function loadKycRecords() {
    if (!supabase) {
      isLoading = false;
      errorMessage = 'Database connection missing.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      const { data: records, error } = await supabase
        .from('kyc_verifications')
        .select(`
          id,
          user_id,
          full_name,
          date_of_birth,
          id_type,
          id_number,
          residential_address,
          id_front_path,
          id_back_path,
          status,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      kycRecords = records || [];

    } catch (error) {
      console.error('KYC LOAD ERROR:', error);
      errorMessage =
        error?.message || 'Failed to load KYC submissions.';
    } finally {
      isLoading = false;
    }
  }

  // -----------------------------------------
  // Initial load
  // -----------------------------------------

  $effect(() => {
    if (supabase) {
      loadKycRecords();
    }
  });

  // -----------------------------------------
  // Filter records
  // -----------------------------------------

  let filteredRecords = $derived(
    kycRecords.filter((record) => {
      const matchesStatus =
        activeFilter === 'all' ||
        record.status === activeFilter;

      const query = searchQuery.trim().toLowerCase();

      if (!query) {
        return matchesStatus;
      }

      const matchesSearch =
        record.full_name?.toLowerCase().includes(query) ||
        record.id_number?.toLowerCase().includes(query) ||
        record.id_type?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    })
  );

  // -----------------------------------------
  // Statistics
  // -----------------------------------------

  let pendingCount = $derived(
    kycRecords.filter((item) => item.status === 'pending').length
  );

  let approvedCount = $derived(
    kycRecords.filter((item) => item.status === 'approved').length
  );

  let rejectedCount = $derived(
    kycRecords.filter((item) => item.status === 'rejected').length
  );

  // -----------------------------------------
  // Open KYC review
  // -----------------------------------------

  async function openKycReview(record) {
    selectedKyc = record;

    frontImageUrl = '';
    backImageUrl = '';
    errorMessage = '';

    try {
      if (record.id_front_path) {
        const { data: frontData, error: frontError } =
          await supabase.storage
            .from('kyc-documents')
            .createSignedUrl(
              record.id_front_path,
              60 * 10
            );

        if (frontError) {
          console.error(
            'FRONT SIGNED URL ERROR:',
            frontError
          );
        } else {
          frontImageUrl = frontData?.signedUrl || '';
        }
      }

      if (record.id_back_path) {
        const { data: backData, error: backError } =
          await supabase.storage
            .from('kyc-documents')
            .createSignedUrl(
              record.id_back_path,
              60 * 10
            );

        if (backError) {
          console.error(
            'BACK SIGNED URL ERROR:',
            backError
          );
        } else {
          backImageUrl = backData?.signedUrl || '';
        }
      }

    } catch (error) {
      console.error('KYC REVIEW ERROR:', error);

      errorMessage =
        error?.message ||
        'Failed to load identity documents.';
    }
  }

  // -----------------------------------------
  // Approve KYC
  // -----------------------------------------

  async function verifyKyc() {
    if (!selectedKyc?.id || !selectedKyc?.user_id) {
      return;
    }

    const confirmed = confirm(
      'Have you reviewed this user\'s identity documents and confirmed that the information is valid?'
    );

    if (!confirmed) {
      return;
    }

    isReviewLoading = true;
    errorMessage = '';
    successMessage = '';

    try {
      // Mark KYC record as approved
      const { error: kycError } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedKyc.id);

      if (kycError) {
        throw new Error(kycError.message);
      }

      // Mark user's profile as KYC verified
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          kyc: true
        })
        .eq('id', selectedKyc.user_id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Update local state
      selectedKyc = {
        ...selectedKyc,
        status: 'approved'
      };

      kycRecords = kycRecords.map((record) =>
        record.id === selectedKyc.id
          ? {
              ...record,
              status: 'approved',
              updated_at: new Date().toISOString()
            }
          : record
      );

      successMessage = 'KYC verification approved successfully.';

    } catch (error) {
      console.error('KYC APPROVAL ERROR:', error);

      errorMessage =
        error?.message ||
        'Failed to approve KYC.';
    } finally {
      isReviewLoading = false;
    }
  }

  // -----------------------------------------
  // Reject KYC
  // -----------------------------------------

  async function rejectKyc() {
    if (!selectedKyc?.id || !selectedKyc?.user_id) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to reject this KYC submission?'
    );

    if (!confirmed) {
      return;
    }

    isReviewLoading = true;
    errorMessage = '';
    successMessage = '';

    try {
      const { error: kycError } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedKyc.id);

      if (kycError) {
        throw new Error(kycError.message);
      }

      // Make sure rejected users aren't marked as verified
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          kyc: false
        })
        .eq('id', selectedKyc.user_id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      selectedKyc = {
        ...selectedKyc,
        status: 'rejected'
      };

      kycRecords = kycRecords.map((record) =>
        record.id === selectedKyc.id
          ? {
              ...record,
              status: 'rejected',
              updated_at: new Date().toISOString()
            }
          : record
      );

      successMessage = 'KYC submission rejected.';

    } catch (error) {
      console.error('KYC REJECTION ERROR:', error);

      errorMessage =
        error?.message ||
        'Failed to reject KYC.';
    } finally {
      isReviewLoading = false;
    }
  }

  // -----------------------------------------
  // Helpers
  // -----------------------------------------

  function formatDate(date) {
    if (!date) return '—';

    return new Date(date).toLocaleDateString(
      'en-NG',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  function formatDateTime(date) {
    if (!date) return '—';

    return new Date(date).toLocaleString(
      'en-NG',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

  function formatIdType(type) {
    if (type === 'passport') {
      return 'International Passport';
    }

    if (type === 'national_id') {
      return 'National Identity Card';
    }

    if (type === 'drivers_license') {
      return "Driver's License";
    }

    return type || 'Unknown';
  }
</script>

<div class="space-y-6">

  <!-- PAGE HEADER -->
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white">
          KYC Verification
        </h1>

        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Review and manage user identity verification submissions.
        </p>
      </div>

      <button
        type="button"
        onclick={loadKycRecords}
        disabled={isLoading}
        class="h-9 px-3.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.8"
          stroke="currentColor"
          class="w-3.5 h-3.5"
          class:animate-spin={isLoading}
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L19.5 9M19.5 9V4.5m0 4.5H15m4.5 3a7.5 7.5 0 0 1-12.8 5.3L4.5 15m0 0v4.5m0-4.5H9"
          />
        </svg>

        Refresh
      </button>
    </div>
  </div>

  <!-- STAT CARDS -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">

    <button
      type="button"
      onclick={() => activeFilter = 'all'}
      class="text-left rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-all"
    >
      <p class="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
        Total
      </p>

      <p class="text-xl font-bold text-white mt-1">
        {kycRecords.length}
      </p>
    </button>

    <button
      type="button"
      onclick={() => activeFilter = 'pending'}
      class="text-left rounded-xl border border-amber-500/15 bg-slate-900/60 p-4 hover:border-amber-500/30 transition-all"
    >
      <p class="text-[10px] uppercase tracking-wider text-amber-500/70 font-semibold">
        Pending
      </p>

      <p class="text-xl font-bold text-amber-400 mt-1">
        {pendingCount}
      </p>
    </button>

    <button
      type="button"
      onclick={() => activeFilter = 'approved'}
      class="text-left rounded-xl border border-emerald-500/15 bg-slate-900/60 p-4 hover:border-emerald-500/30 transition-all"
    >
      <p class="text-[10px] uppercase tracking-wider text-emerald-500/70 font-semibold">
        Approved
      </p>

      <p class="text-xl font-bold text-emerald-400 mt-1">
        {approvedCount}
      </p>
    </button>

    <button
      type="button"
      onclick={() => activeFilter = 'rejected'}
      class="text-left rounded-xl border border-rose-500/15 bg-slate-900/60 p-4 hover:border-rose-500/30 transition-all"
    >
      <p class="text-[10px] uppercase tracking-wider text-rose-500/70 font-semibold">
        Rejected
      </p>

      <p class="text-xl font-bold text-rose-400 mt-1">
        {rejectedCount}
      </p>
    </button>

  </div>

  <!-- FILTER BAR -->
  <div class="flex flex-col sm:flex-row gap-3">

    <div class="relative flex-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.8"
        stroke="currentColor"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z"
        />
      </svg>

      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search name, ID number or document type..."
        class="w-full h-10 bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
      />
    </div>

    <select
      bind:value={activeFilter}
      class="h-10 bg-slate-900/60 border border-slate-800 rounded-lg px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50"
    >
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
      <option value="all">All Submissions</option>
    </select>

  </div>

  {#if errorMessage}
    <div class="p-3.5 bg-rose-500/[0.06] border border-rose-500/20 text-rose-400 text-xs rounded-xl">
      {errorMessage}
    </div>
  {/if}

  {#if successMessage}
    <div class="p-3.5 bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
      {successMessage}
    </div>
  {/if}

  <!-- MAIN CONTENT -->
  <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">

    <!-- SUBMISSION LIST -->
    <div class="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">

      <div class="px-4 py-3.5 border-b border-slate-800">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-200">
            Submissions
          </span>

          <span class="text-[10px] text-slate-500">
            {filteredRecords.length}
          </span>
        </div>
      </div>

      {#if isLoading}
        <div class="p-8 text-center text-xs text-slate-500">
          Loading submissions...
        </div>

      {:else if filteredRecords.length === 0}
        <div class="p-8 text-center">
          <div class="w-10 h-10 mx-auto rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-500 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l4.414 4.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
              />
            </svg>
          </div>

          <p class="text-xs text-slate-400">
            No KYC submissions found.
          </p>
        </div>

      {:else}

        <div class="divide-y divide-slate-800/70 max-h-[650px] overflow-y-auto">

          {#each filteredRecords as record}
            <button
              type="button"
              onclick={() => openKycReview(record)}
              class="w-full text-left px-4 py-3.5 hover:bg-slate-800/40 transition-all"
              class:bg-slate-800/50={selectedKyc?.id === record.id}
            >
              <div class="flex items-center justify-between gap-3">

                <div class="min-w-0">
                  <p class="text-xs font-semibold text-slate-200 truncate">
                    {record.full_name}
                  </p>

                  <p class="text-[10px] text-slate-500 mt-1">
                    {formatIdType(record.id_type)}
                  </p>

                  <p class="text-[10px] text-slate-600 mt-0.5">
                    {formatDate(record.created_at)}
                  </p>
                </div>

                <span
                  class="shrink-0 px-2 py-1 rounded-full text-[9px] font-semibold capitalize"
                  class:bg-amber-500/10={record.status === 'pending'}
                  class:text-amber-400={record.status === 'pending'}
                  class:border={record.status === 'pending'}
                  class:border-amber-500/20={record.status === 'pending'}
                  class:bg-emerald-500/10={record.status === 'approved'}
                  class:text-emerald-400={record.status === 'approved'}
                  class:border-emerald-500/20={record.status === 'approved'}
                  class:bg-rose-500/10={record.status === 'rejected'}
                  class:text-rose-400={record.status === 'rejected'}
                  class:border-rose-500/20={record.status === 'rejected'}
                >
                  {record.status}
                </span>

              </div>
            </button>
          {/each}

        </div>
      {/if}
    </div>

    <!-- REVIEW PANEL -->
    <div class="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden min-h-[500px]">

      {#if selectedKyc}

        <!-- REVIEW HEADER -->
        <div class="px-5 py-4 border-b border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Identity Verification
              </p>

              <h2 class="text-lg font-semibold text-white mt-1">
                {selectedKyc.full_name}
              </h2>
            </div>

            <span
              class="self-start px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize"
              class:bg-amber-500/10={selectedKyc.status === 'pending'}
              class:text-amber-400={selectedKyc.status === 'pending'}
              class:border={selectedKyc.status === 'pending'}
              class:border-amber-500/20={selectedKyc.status === 'pending'}
              class:bg-emerald-500/10={selectedKyc.status === 'approved'}
              class:text-emerald-400={selectedKyc.status === 'approved'}
              class:border-emerald-500/20={selectedKyc.status === 'approved'}
              class:bg-rose-500/10={selectedKyc.status === 'rejected'}
              class:text-rose-400={selectedKyc.status === 'rejected'}
              class:border-rose-500/20={selectedKyc.status === 'rejected'}
            >
              {selectedKyc.status}
            </span>

          </div>
        </div>

        <!-- DETAILS -->
        <div class="p-5 space-y-5">

          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
              Personal Information
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div class="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <p class="text-[10px] text-slate-500">
                  Full Name
                </p>

                <p class="text-xs text-slate-200 mt-1">
                  {selectedKyc.full_name || '—'}
                </p>
              </div>

              <div class="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <p class="text-[10px] text-slate-500">
                  Date of Birth
                </p>

                <p class="text-xs text-slate-200 mt-1">
                  {formatDate(selectedKyc.date_of_birth)}
                </p>
              </div>

              <div class="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <p class="text-[10px] text-slate-500">
                  Document Type
                </p>

                <p class="text-xs text-slate-200 mt-1">
                  {formatIdType(selectedKyc.id_type)}
                </p>
              </div>

              <div class="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <p class="text-[10px] text-slate-500">
                  Document Number
                </p>

                <p class="text-xs text-slate-200 mt-1 font-mono">
                  {selectedKyc.id_number || '—'}
                </p>
              </div>

            </div>
          </div>

          <!-- ADDRESS -->
          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
              Residential Address
            </p>

            <div class="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <p class="text-xs text-slate-300 leading-relaxed">
                {selectedKyc.residential_address || 'No address provided.'}
              </p>
            </div>
          </div>

          <!-- DOCUMENTS -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <p class="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Identity Documents
              </p>

              <span class="text-[10px] text-slate-600">
                Review manually
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <!-- FRONT -->
              <div class="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">

                <div class="px-3 py-2.5 border-b border-slate-800">
                  <p class="text-[10px] font-semibold text-slate-400">
                    Document Front
                  </p>
                </div>

                {#if frontImageUrl}
                  <a
                    href={frontImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block bg-slate-950 aspect-[4/3] overflow-hidden group"
                  >
                    <img
                      src={frontImageUrl}
                      alt="KYC document front"
                      class="w-full h-full object-contain group-hover:scale-[1.02] transition-transform"
                    />
                  </a>
                {:else}
                  <div class="aspect-[4/3] flex items-center justify-center text-xs text-slate-600">
                    Document unavailable
                  </div>
                {/if}

              </div>

              <!-- BACK -->
              <div class="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">

                <div class="px-3 py-2.5 border-b border-slate-800">
                  <p class="text-[10px] font-semibold text-slate-400">
                    Document Back
                  </p>
                </div>

                {#if backImageUrl}
                  <a
                    href={backImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block bg-slate-950 aspect-[4/3] overflow-hidden group"
                  >
                    <img
                      src={backImageUrl}
                      alt="KYC document back"
                      class="w-full h-full object-contain group-hover:scale-[1.02] transition-transform"
                    />
                  </a>
                {:else}
                  <div class="aspect-[4/3] flex items-center justify-center text-xs text-slate-600">
                    No back document uploaded
                  </div>
                {/if}

              </div>

            </div>
          </div>

          <!-- SUBMISSION INFO -->
          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
              Submission Information
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div class="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <p class="text-[10px] text-slate-500">
                  Submitted
                </p>

                <p class="text-xs text-slate-300 mt-1">
                  {formatDateTime(selectedKyc.created_at)}
                </p>
              </div>

              <div class="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <p class="text-[10px] text-slate-500">
                  Last Updated
                </p>

                <p class="text-xs text-slate-300 mt-1">
                  {formatDateTime(selectedKyc.updated_at)}
                </p>
              </div>

            </div>
          </div>

          <!-- ACTIONS -->
          <div class="pt-4 border-t border-slate-800">

            {#if selectedKyc.status === 'pending'}

              <div class="flex flex-col sm:flex-row gap-2.5">

                <button
                  type="button"
                  onclick={rejectKyc}
                  disabled={isReviewLoading}
                  class="h-10 flex-1 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Reject KYC
                </button>

                <button
                  type="button"
                  onclick={verifyKyc}
                  disabled={isReviewLoading}
                  class="h-10 flex-[2] rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {#if isReviewLoading}
                    <svg
                      class="animate-spin w-3.5 h-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />

                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
                      />
                    </svg>

                    Verifying...
                  {:else}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.8"
                      stroke="currentColor"
                      class="w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m5 12 4.5 4.5L19 7"
                      />
                    </svg>

                    Verify KYC
                  {/if}
                </button>

              </div>

              <p class="text-[10px] text-slate-600 text-center mt-2.5">
                By verifying, you confirm that you have manually reviewed the submitted identity documents.
              </p>

            {:else if selectedKyc.status === 'approved'}

              <div class="flex items-center justify-center gap-2 h-10 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m5 12 4.5 4.5L19 7"
                  />
                </svg>

                KYC Verified
              </div>

            {:else}

              <div class="flex items-center justify-center gap-2 h-10 rounded-lg bg-rose-500/[0.06] border border-rose-500/20 text-rose-400 text-xs font-semibold">
                KYC Rejected
              </div>

            {/if}

          </div>

        </div>

      {:else}

        <!-- EMPTY REVIEW STATE -->

        <div class="min-h-[500px] flex items-center justify-center p-8">
          <div class="text-center max-w-xs">

            <div class="w-12 h-12 mx-auto rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 9h.01M9 9h.01M12 12h.01M7 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.586a1 1 0 0 1-.707-.293l-.828-.828A1 1 0 0 0 14.172 3h-4.344a1 1 0 0 0-.707.293l-.828.828A1 1 0 0 1 7.586 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1Z"
                />
              </svg>
            </div>

            <h3 class="text-sm font-semibold text-slate-300">
              Select a submission
            </h3>

            <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Select a KYC submission from the list to review the user's identity information and uploaded documents.
            </p>

          </div>
        </div>

      {/if}

    </div>

  </div>

</div>
