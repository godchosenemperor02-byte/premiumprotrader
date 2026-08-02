<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let pageLanguage = 'en';
  export let includedLanguages = ''; // e.g., 'es,fr,de' (leave empty for all)

  onMount(() => {
    if (!browser) return;

    // Set up Google's callback function
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: pageLanguage,
          includedLanguages: includedLanguages || undefined,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
      );
    };

    // Inject Google Translate script if not already present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  });
</script>

<div id="google_translate_element"></div>

<style>
  /* Clean up extra space added by Google's top bar */
  :global(.goog-te-banner-frame) {
    display: none !important;
  }
  :global(body) {
    top: 0px !important;
  }
</style>
