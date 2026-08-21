<script>
  let { data } = $props();
  let supabase = $derived(data?.supabase);

  // KYC records
  let kycRecords = $state([]);
  let isLoading = $state(true);
  let errorMessage = $state('');
  let successMessage = $state('');
  let activeFilter = $state('all');
  let searchQuery = $state('');

  // Modal
  let selectedRecord = $state(null);
  let isModalOpen = $state(false);
  let isFetchingUrls = $state(false);

  let documentUrls = $state({
    idFront: null,
    idBack: null
  });

  // Verification state
  let isVerifying = $state(false);

  // --------------------------------------------------
  // LOAD KYC RECORDS
  // --------------------------------------------------

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
          status,
          id_front_path,
          id_back_path,
          created_at
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

  $effect(() => {
    if (supabase) {
      loadKycRecords();
    }
  });

  // --------------------------------------------------
  // FILTERED RECORDS
  // --------------------------------------------------

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

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  function formatDate(date) {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  function formatIdType(type) {
    const types = {
      passport: 'International Passport',
      national_id: 'National Identity Card',
      drivers_license: "Driver's License"
    };

    return types[type] || type || 'Unknown';
  }

  function getStatusClasses(status) {
    if (status === 'approved') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }

    if (status === 'rejected') {
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }

    return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  }

  // --------------------------------------------------
  // OPEN KYC MODAL
  // --------------------------------------------------

  async function openRecordModal(record) {
    selectedRecord = record;
    isModalOpen = true;
    isFetchingUrls = true;

    documentUrls = {
      idFront: null,
      idBack: null
    };

    try {
      async function getSignedUrl(filePath) {
        if (!filePath) {
          return null;
        }

        const { data, error } = await supabase.storage
          .from('kyc-documents')
          .createSignedUrl(filePath, 3600);

        if (error) {
          console.error(
            'SIGNED URL ERROR:',
            error.message
          );

          return null;
        }

        return data?.signedUrl || null;
      }

      const [idFront, idBack] = await Promise.all([
        getSignedUrl(record.id_front_path),
        getSignedUrl(record.id_back_path)
      ]);

      documentUrls = {
        idFront,
        idBack
      };
    } catch (error) {
      console.error(
        'DOCUMENT URL ERROR:',
        error
      );
    } finally {
      isFetchingUrls = false;
    }
  }

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  function closeModal() {
    if (isVerifying) return;

    isModalOpen = false;
    selectedRecord = null;

    documentUrls = {
      idFront: null,
      idBack: null
    };
  }

  // --------------------------------------------------
  // MANUAL KYC VERIFICATION
  // --------------------------------------------------

  async function verifyKyc(status) {
    if (!selectedRecord || !supabase) {
      return;
    }

    isVerifying = true;
    errorMessage = '';
    successMessage = '';

    try {
      /*
       * Update the KYC submission itself.
       *
       * This does NOT happen automatically.
       * It only happens when the admin presses
       * Approve or Reject.
       */

      const { error: kycError } = await supabase
        .from('kyc_verifications')
        .update({
          status: status
        })
        .eq('id', selectedRecord.id);

      if (kycError) {
        throw new Error(
          `Failed to update KYC: ${kycError.message}`
        );
      }

      /*
       * If approved, mark the user's profile as verified.
       */

      if (status === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            kyc: true
          })
          .eq('id', selectedRecord.user_id);

        if (profileError) {
          throw new Error(
            `KYC approved but profile could not be updated: ${profileError.message}`
          );
        }
      }

      /*
       * If rejected, make sure the profile isn't
       * still marked as verified.
       */

      if (status === 'rejected') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            kyc: false
          })
          .eq('id', selectedRecord.user_id);

        if (profileError) {
          throw new Error(
            `KYC rejected but profile could not be updated: ${profileError.message}`
          );
        }
      }

      // Update local record immediately
      kycRecords = kycRecords.map((record) => {
        if (record.id === selectedRecord.id) {
          return {
            ...record,
            status: status
          };
        }

        return record;
      });

      selectedRecord = {
        ...selectedRecord,
        status: status
      };

      successMessage =
        status === 'approved'
          ? 'KYC verification approved successfully.'
          : 'KYC verification rejected.';

    } catch (error) {
      console.error(
        'KYC VERIFICATION ERROR:',
        error
      );

      errorMessage =
        error?.message ||
        'Failed to update KYC verification.';
    } finally {
      isVerifying = false;
    }
  }
</script>


<!-- HEADER -->

<div class="space-y-5">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

    <div>
      <h1 class="text-xl font-bold tracking-tight text-white">
        KYC Submissions
      </h1>

      <p class="text-xs text-slate-400 mt-1">
        Review and manually verify identity verification records.
      </p>
    </div>

    <button
      type="button"
      onclick={loadKycRecords}
      disabled={isLoading}
      class="h-9 px-4 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
    >

      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.8"
        stroke="currentColor"
        class:w-3.5={true}
        class:h-3.5={true}
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


  <!-- SEARCH / FILTER -->

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
        placeholder="Search name, ID number or type..."
        class="w-full h-10 bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
      />

    </div>


    <select
      bind:value={activeFilter}
      class="h-10 bg-slate-900/60 border border-slate-800 rounded-lg px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50"
    >
      <option value="all">All Statuses</option>
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
    </select>

  </div>


  <!-- MESSAGES -->

  {#if errorMessage}
    <div class="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
      {errorMessage}
    </div>
  {/if}

  {#if successMessage}
    <div class="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
      {successMessage}
    </div>
  {/if}


  <!-- TABLE -->

  <div class="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">

    {#if isLoading}

      <div class="p-10 text-center text-xs text-slate-500">
        Loading KYC submissions...
      </div>

    {:else if filteredRecords.length === 0}

      <div class="p-10 text-center">
        <p class="text-sm text-slate-400">
          No KYC submissions match your criteria.
        </p>

        <p class="text-xs text-slate-600 mt-1">
          Submitted verification requests will appear here.
        </p>
      </div>

    {:else}

      <div class="overflow-x-auto">

        <table class="w-full text-left border-collapse text-xs">

          <thead>
            <tr class="border-b border-slate-800 bg-slate-950/40">

              <th class="py-3 px-4 text-slate-400 font-semibold">
                User
              </th>

              <th class="py-3 px-4 text-slate-400 font-semibold">
                Document
              </th>

              <th class="py-3 px-4 text-slate-400 font-semibold">
                ID Number
              </th>

              <th class="py-3 px-4 text-slate-400 font-semibold">
                Status
              </th>

              <th class="py-3 px-4 text-slate-400 font-semibold">
                Submitted
              </th>

              <th class="py-3 px-4 text-right text-slate-400 font-semibold">
                Action
              </th>

            </tr>
          </thead>


          <tbody class="divide-y divide-slate-800/60">

            {#each filteredRecords as record}

              <tr class="hover:bg-slate-800/30 transition-colors">

                <td class="py-3.5 px-4">

                  <div class="font-semibold text-slate-200">
                    {record.full_name || '—'}
                  </div>

                </td>


                <td class="py-3.5 px-4 text-slate-400">
                  {formatIdType(record.id_type)}
                </td>


                <td class="py-3.5 px-4 text-slate-300 font-mono">
                  {record.id_number || '—'}
                </td>


                <td class="py-3.5 px-4">

                  <span
                    class={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold capitalize ${getStatusClasses(record.status)}`}
                  >
                    {record.status || 'pending'}
                  </span>

                </td>


                <td class="py-3.5 px-4 text-slate-500">
                  {formatDate(record.created_at)}
                </td>


                <td class="py-3.5 px-4 text-right">

                  <button
                    type="button"
                    onclick={() => openRecordModal(record)}
                    class="h-8 px-3 rounded-lg border border-blue-500/25 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 text-[11px] font-semibold transition-all"
                  >
                    Review
                  </button>

                </td>

              </tr>

            {/each}

          </tbody>

        </table>

      </div>

    {/if}

  </div>

</div>


<!-- KYC REVIEW MODAL -->

{#if isModalOpen && selectedRecord}

  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm"
  >

    <div
      class="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
    >

      <!-- MODAL HEADER -->

      <div class="sticky top-0 z-10 flex items-start justify-between gap-4 px-5 sm:px-6 py-4 bg-slate-950/95 backdrop-blur border-b border-slate-800">

        <div>

          <div class="flex items-center gap-2 flex-wrap">

            <h2 class="text-base sm:text-lg font-bold text-white">
              KYC Review
            </h2>

            <span
              class={`px-2 py-1 rounded-full text-[10px] font-semibold capitalize ${getStatusClasses(selectedRecord.status)}`}
            >
              {selectedRecord.status}
            </span>

          </div>

          <p class="text-xs text-slate-500 mt-1">
            Review the submitted information before making a decision.
          </p>

        </div>


        <button
          type="button"
          onclick={closeModal}
          disabled={isVerifying}
          class="w-8 h-8 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center"
        >

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
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>

        </button>

      </div>


      <div class="p-5 sm:p-6 space-y-6">

        <!-- USER INFORMATION -->

        <div>

          <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            Applicant Information
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800">

            <div class="bg-slate-900/80 p-4">
              <span class="block text-[11px] text-slate-500 mb-1">
                Legal Full Name
              </span>

              <span class="text-sm font-medium text-slate-200">
                {selectedRecord.full_name || '—'}
              </span>
            </div>


            <div class="bg-slate-900/80 p-4">
              <span class="block text-[11px] text-slate-500 mb-1">
                Date of Birth
              </span>

              <span class="text-sm font-medium text-slate-200">
                {formatDate(selectedRecord.date_of_birth)}
              </span>
            </div>


            <div class="bg-slate-900/80 p-4">
              <span class="block text-[11px] text-slate-500 mb-1">
                Document Type
              </span>

              <span class="text-sm font-medium text-slate-200">
                {formatIdType(selectedRecord.id_type)}
              </span>
            </div>


            <div class="bg-slate-900/80 p-4">
              <span class="block text-[11px] text-slate-500 mb-1">
                Document Number
              </span>

              <span class="text-sm font-medium text-slate-200 font-mono">
                {selectedRecord.id_number || '—'}
              </span>
            </div>


            <div class="sm:col-span-2 bg-slate-900/80 p-4">

              <span class="block text-[11px] text-slate-500 mb-1">
                Residential Address
              </span>

              <span class="text-sm font-medium text-slate-200">
                {selectedRecord.residential_address || '—'}
              </span>

            </div>

          </div>

        </div>


        <!-- DOCUMENTS -->

        <div>

          <div class="flex items-center justify-between mb-3">

            <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Identity Documents
            </h3>

            <span class="text-[10px] text-slate-600">
              Secure preview
            </span>

          </div>


          {#if isFetchingUrls}

            <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-12 text-center">

              <div class="inline-block w-5 h-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-3"></div>

              <p class="text-xs text-slate-500">
                Loading identity documents...
              </p>

            </div>

          {:else}

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <!-- FRONT -->

              <div class="space-y-2">

                <div class="flex items-center justify-between">

                  <span class="text-xs font-medium text-slate-300">
                    ID Front
                  </span>

                  {#if documentUrls.idFront}
                    <span class="text-[10px] text-emerald-400">
                      Available
                    </span>
                  {/if}

                </div>


                <div class="aspect-[4/3] rounded-xl border border-slate-800 bg-slate-900 overflow-hidden flex items-center justify-center">

                  {#if documentUrls.idFront}

                    <a
                      href={documentUrls.idFront}
                      target="_blank"
                      rel="noreferrer"
                      class="block w-full h-full"
                    >

                      <img
                        src={documentUrls.idFront}
                        alt="ID front"
                        class="w-full h-full object-contain hover:scale-[1.02] transition-transform duration-200"
                      />

                    </a>

                  {:else}

                    <div class="text-center">
                      <p class="text-xs text-slate-600">
                        Front image unavailable
                      </p>
                    </div>

                  {/if}

                </div>

              </div>


              <!-- BACK -->

              <div class="space-y-2">

                <div class="flex items-center justify-between">

                  <span class="text-xs font-medium text-slate-300">
                    ID Back
                  </span>

                  {#if documentUrls.idBack}
                    <span class="text-[10px] text-emerald-400">
                      Available
                    </span>
                  {/if}

                </div>


                <div class="aspect-[4/3] rounded-xl border border-slate-800 bg-slate-900 overflow-hidden flex items-center justify-center">

                  {#if documentUrls.idBack}

                    <a
                      href={documentUrls.idBack}
                      target="_blank"
                      rel="noreferrer"
                      class="block w-full h-full"
                    >

                      <img
                        src={documentUrls.idBack}
                        alt="ID back"
                        class="w-full h-full object-contain hover:scale-[1.02] transition-transform duration-200"
                      />

                    </a>

                  {:else}

                    <div class="text-center">
                      <p class="text-xs text-slate-600">
                        No back image provided
                      </p>
                    </div>

                  {/if}

                </div>

              </div>

            </div>

          {/if}

        </div>


        <!-- VERIFICATION ACTION -->

        <div class="border-t border-slate-800 pt-5">

          {#if selectedRecord.status === 'pending'}

            <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-4">

              <div class="mb-4">

                <p class="text-sm font-semibold text-white">
                  Verification Decision
                </p>

                <p class="text-xs text-slate-500 mt-1">
                  Carefully compare the submitted information with the identity document before approving.
                </p>

              </div>


              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <!-- REJECT -->

                <button
                  type="button"
                  onclick={() => verifyKyc('rejected')}
                  disabled={isVerifying}
                  class="h-10 rounded-lg border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/15 text-rose-400 text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >

                  {#if isVerifying}
                    Processing...
                  {:else}
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
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>

                    Reject Verification
                  {/if}

                </button>


                <!-- APPROVE -->

                <button
                  type="button"
                  onclick={() => verifyKyc('approved')}
                  disabled={isVerifying}
                  class="h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >

                  {#if isVerifying}

                    Processing...

                  {:else}

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
                        d="m5 12 4 4L19 6"
                      />
                    </svg>

                    Approve Verification

                  {/if}

                </button>

              </div>

            </div>

          {:else}

            <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex items-center justify-between gap-4">

              <div>

                <p class="text-sm font-semibold text-slate-200">
                  Verification {selectedRecord.status === 'approved' ? 'Approved' : 'Rejected'}
                </p>

                <p class="text-xs text-slate-500 mt-1">
                  This KYC submission has already been reviewed.
                </p>

              </div>

              <span
                class={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${getStatusClasses(selectedRecord.status)}`}
              >
                {selectedRecord.status}
              </span>

            </div>

          {/if}

        </div>

      </div>


      <!-- FOOTER -->

      <div class="px-5 sm:px-6 py-4 border-t border-slate-800 flex justify-end">

        <button
          type="button"
          onclick={closeModal}
          disabled={isVerifying}
          class="h-9 px-4 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
        >
          Close
        </button>

      </div>

    </div>

  </div>

{/if}
