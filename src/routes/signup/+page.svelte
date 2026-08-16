<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Eye, Lock, Mail, ShieldCheck, ArrowRight, ALargeSmall, Loader2, Globe, Phone, MapPin, Calendar } from "lucide-svelte";
  import { supabase } from "$lib/supabase";
  import { goto } from "$app/navigation";
  
  let user = $state({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    country: '',
    currency: '',
    phonenumber: '',
    address: '',
    dob: '',
    admin: false
  })
  let loading = $state(false);
  let errorMsg = $state("");
  let successMsg = $state("");

  // Minimal country -> currency mapping. Add more entries if you need broader coverage.
  const countryOptions = [
    { name: 'United States', code: 'US', currency: 'USD' },
    { name: 'United Kingdom', code: 'GB', currency: 'GBP' },
    { name: 'Canada', code: 'CA', currency: 'CAD' },
    { name: 'Australia', code: 'AU', currency: 'AUD' },
    { name: 'Germany', code: 'DE', currency: 'EUR' },
    { name: 'France', code: 'FR', currency: 'EUR' },
    { name: 'Spain', code: 'ES', currency: 'EUR' },
    { name: 'Italy', code: 'IT', currency: 'EUR' },
    { name: 'Japan', code: 'JP', currency: 'JPY' },
    { name: 'China', code: 'CN', currency: 'CNY' },
    { name: 'India', code: 'IN', currency: 'INR' },
    { name: 'Brazil', code: 'BR', currency: 'BRL' },
    { name: 'South Africa', code: 'ZA', currency: 'ZAR' },
    { name: 'Nigeria', code: 'NG', currency: 'NGN' },
    { name: 'Kenya', code: 'KE', currency: 'KES' },
    { name: 'Russia', code: 'RU', currency: 'RUB' },
    { name: 'United Arab Emirates', code: 'AE', currency: 'AED' },
    { name: 'Saudi Arabia', code: 'SA', currency: 'SAR' },
    { name: 'Switzerland', code: 'CH', currency: 'CHF' },
    { name: 'Sweden', code: 'SE', currency: 'SEK' },
    { name: 'Norway', code: 'NO', currency: 'NOK' },
    { name: 'Denmark', code: 'DK', currency: 'DKK' },
    { name: 'Netherlands', code: 'NL', currency: 'EUR' },
    { name: 'Belgium', code: 'BE', currency: 'EUR' },
    { name: 'Mexico', code: 'MX', currency: 'MXN' },
    { name: 'Argentina', code: 'AR', currency: 'ARS' },
    { name: 'Chile', code: 'CL', currency: 'CLP' },
    { name: 'New Zealand', code: 'NZ', currency: 'NZD' },
    { name: 'Singapore', code: 'SG', currency: 'SGD' },
    { name: 'Hong Kong', code: 'HK', currency: 'HKD' },
    { name: 'South Korea', code: 'KR', currency: 'KRW' },
    { name: 'Afghanistan', code: 'AF', currency: 'AFN' },
    { name: 'Albania', code: 'AL', currency: 'ALL' },
    { name: 'Algeria', code: 'DZ', currency: 'DZD' },
    { name: 'American Samoa', code: 'AS', currency: 'USD' },
    { name: 'Andorra', code: 'AD', currency: 'EUR' },
    { name: 'Angola', code: 'AO', currency: 'AOA' },
    { name: 'Anguilla', code: 'AI', currency: 'XCD' },
    { name: 'Antarctica', code: 'AQ', currency: 'XXX' },
    { name: 'Antigua and Barbuda', code: 'AG', currency: 'XCD' },
    { name: 'Armenia', code: 'AM', currency: 'AMD' },
    { name: 'Aruba', code: 'AW', currency: 'AWG' },
    { name: 'Austria', code: 'AT', currency: 'EUR' },
    { name: 'Azerbaijan', code: 'AZ', currency: 'AZN' },
    { name: 'Bahamas', code: 'BS', currency: 'BSD' },
    { name: 'Bahrain', code: 'BH', currency: 'BHD' },
    { name: 'Bangladesh', code: 'BD', currency: 'BDT' },
    { name: 'Barbados', code: 'BB', currency: 'BBD' },
    { name: 'Belarus', code: 'BY', currency: 'BYN' },
    { name: 'Belize', code: 'BZ', currency: 'BZD' },
    { name: 'Benin', code: 'BJ', currency: 'XOF' },
    { name: 'Bermuda', code: 'BM', currency: 'BMD' },
    { name: 'Bhutan', code: 'BT', currency: 'BTN' },
    { name: 'Bolivia', code: 'BO', currency: 'BOB' },
    { name: 'Bosnia and Herzegovina', code: 'BA', currency: 'BAM' },
    { name: 'Botswana', code: 'BW', currency: 'BWP' },
    { name: 'Bouvet Island', code: 'BV', currency: 'NOK' },
    { name: 'British Indian Ocean Territory', code: 'IO', currency: 'USD' },
    { name: 'Brunei', code: 'BN', currency: 'BND' },
    { name: 'Bulgaria', code: 'BG', currency: 'BGN' },
    { name: 'Burkina Faso', code: 'BF', currency: 'XOF' },
    { name: 'Burundi', code: 'BI', currency: 'BIF' },
    { name: 'Cambodia', code: 'KH', currency: 'KHR' },
    { name: 'Cameroon', code: 'CM', currency: 'XAF' },
    { name: 'Cape Verde', code: 'CV', currency: 'CVE' },
    { name: 'Cayman Islands', code: 'KY', currency: 'KYD' },
    { name: 'Central African Republic', code: 'CF', currency: 'XAF' },
    { name: 'Chad', code: 'TD', currency: 'XAF' },
    { name: 'Christmas Island', code: 'CX', currency: 'AUD' },
    { name: 'Cocos Islands', code: 'CC', currency: 'AUD' },
    { name: 'Colombia', code: 'CO', currency: 'COP' },
    { name: 'Comoros', code: 'KM', currency: 'KMF' },
    { name: 'Congo', code: 'CG', currency: 'XAF' },
    { name: 'Cook Islands', code: 'CK', currency: 'NZD' },
    { name: 'Costa Rica', code: 'CR', currency: 'CRC' },
    { name: 'Croatia', code: 'HR', currency: 'EUR' },
    { name: 'Cuba', code: 'CU', currency: 'CUP' },
    { name: 'Curaçao', code: 'CW', currency: 'ANG' },
    { name: 'Cyprus', code: 'CY', currency: 'EUR' },
    { name: 'Czech Republic', code: 'CZ', currency: 'CZK' },
    { name: 'Democratic Republic of the Congo', code: 'CD', currency: 'CDF' },
    { name: 'Djibouti', code: 'DJ', currency: 'DJF' },
    { name: 'Dominica', code: 'DM', currency: 'XCD' },
    { name: 'Dominican Republic', code: 'DO', currency: 'DOP' },
    { name: 'Ecuador', code: 'EC', currency: 'USD' },
    { name: 'Egypt', code: 'EG', currency: 'EGP' },
    { name: 'El Salvador', code: 'SV', currency: 'USD' },
    { name: 'Equatorial Guinea', code: 'GQ', currency: 'XAF' },
    { name: 'Eritrea', code: 'ER', currency: 'ERN' },
    { name: 'Estonia', code: 'EE', currency: 'EUR' },
    { name: 'Eswatini', code: 'SZ', currency: 'SZL' },
    { name: 'Ethiopia', code: 'ET', currency: 'ETB' },
    { name: 'Falkland Islands', code: 'FK', currency: 'FKP' },
    { name: 'Faroe Islands', code: 'FO', currency: 'DKK' },
    { name: 'Fiji', code: 'FJ', currency: 'FJD' },
    { name: 'Finland', code: 'FI', currency: 'EUR' },
    { name: 'French Guiana', code: 'GF', currency: 'EUR' },
    { name: 'French Polynesia', code: 'PF', currency: 'XPF' },
    { name: 'French Southern Territories', code: 'TF', currency: 'EUR' },
    { name: 'Gabon', code: 'GA', currency: 'XAF' },
    { name: 'Gambia', code: 'GM', currency: 'GMD' },
    { name: 'Georgia', code: 'GE', currency: 'GEL' },
    { name: 'Ghana', code: 'GH', currency: 'GHS' },
    { name: 'Gibraltar', code: 'GI', currency: 'GIP' },
    { name: 'Greece', code: 'GR', currency: 'EUR' },
    { name: 'Greenland', code: 'GL', currency: 'DKK' },
    { name: 'Grenada', code: 'GD', currency: 'XCD' },
    { name: 'Guadeloupe', code: 'GP', currency: 'EUR' },
    { name: 'Guam', code: 'GU', currency: 'USD' },
    { name: 'Guatemala', code: 'GT', currency: 'GTQ' },
    { name: 'Guernsey', code: 'GG', currency: 'GBP' },
    { name: 'Guinea', code: 'GN', currency: 'GNF' },
    { name: 'Guinea-Bissau', code: 'GW', currency: 'XOF' },
    { name: 'Guyana', code: 'GY', currency: 'GYD' },
    { name: 'Haiti', code: 'HT', currency: 'HTG' },
    { name: 'Heard Island and McDonald Islands', code: 'HM', currency: 'AUD' },
    { name: 'Holy See', code: 'VA', currency: 'EUR' },
    { name: 'Honduras', code: 'HN', currency: 'HNL' },
    { name: 'Hungary', code: 'HU', currency: 'HUF' },
    { name: 'Iceland', code: 'IS', currency: 'ISK' },
    { name: 'Indonesia', code: 'ID', currency: 'IDR' },
    { name: 'Iran', code: 'IR', currency: 'IRR' },
    { name: 'Iraq', code: 'IQ', currency: 'IQD' },
    { name: 'Ireland', code: 'IE', currency: 'EUR' },
    { name: 'Isle of Man', code: 'IM', currency: 'GBP' },
    { name: 'Israel', code: 'IL', currency: 'ILS' },
    { name: 'Ivory Coast', code: 'CI', currency: 'XOF' },
    { name: 'Jamaica', code: 'JM', currency: 'JMD' },
    { name: 'Jersey', code: 'JE', currency: 'GBP' },
    { name: 'Jordan', code: 'JO', currency: 'JOD' },
    { name: 'Kazakhstan', code: 'KZ', currency: 'KZT' },
    { name: 'Kiribati', code: 'KI', currency: 'AUD' },
    { name: 'Kuwait', code: 'KW', currency: 'KWD' },
    { name: 'Kyrgyzstan', code: 'KG', currency: 'KGS' },
    { name: 'Laos', code: 'LA', currency: 'LAK' },
    { name: 'Latvia', code: 'LV', currency: 'EUR' },
    { name: 'Lebanon', code: 'LB', currency: 'LBP' },
    { name: 'Lesotho', code: 'LS', currency: 'LSL' },
    { name: 'Liberia', code: 'LR', currency: 'LRD' },
    { name: 'Libya', code: 'LY', currency: 'LYD' },
    { name: 'Liechtenstein', code: 'LI', currency: 'CHF' },
    { name: 'Lithuania', code: 'LT', currency: 'EUR' },
    { name: 'Luxembourg', code: 'LU', currency: 'EUR' },
    { name: 'Macao', code: 'MO', currency: 'MOP' },
    { name: 'Madagascar', code: 'MG', currency: 'MGA' },
    { name: 'Malawi', code: 'MW', currency: 'MWK' },
    { name: 'Malaysia', code: 'MY', currency: 'MYR' },
    { name: 'Maldives', code: 'MV', currency: 'MVR' },
    { name: 'Mali', code: 'ML', currency: 'XOF' },
    { name: 'Malta', code: 'MT', currency: 'EUR' },
    { name: 'Marshall Islands', code: 'MH', currency: 'USD' },
    { name: 'Martinique', code: 'MQ', currency: 'EUR' },
    { name: 'Mauritania', code: 'MR', currency: 'MRU' },
    { name: 'Mauritius', code: 'MU', currency: 'MUR' },
    { name: 'Mayotte', code: 'YT', currency: 'EUR' },
    { name: 'Micronesia', code: 'FM', currency: 'USD' },
    { name: 'Moldova', code: 'MD', currency: 'MDL' },
    { name: 'Monaco', code: 'MC', currency: 'EUR' },
    { name: 'Mongolia', code: 'MN', currency: 'MNT' },
    { name: 'Montenegro', code: 'ME', currency: 'EUR' },
    { name: 'Montserrat', code: 'MS', currency: 'XCD' },
    { name: 'Morocco', code: 'MA', currency: 'MAD' },
    { name: 'Mozambique', code: 'MZ', currency: 'MZN' },
    { name: 'Myanmar', code: 'MM', currency: 'MMK' },
    { name: 'Namibia', code: 'NA', currency: 'NAD' },
    { name: 'Nauru', code: 'NR', currency: 'AUD' },
    { name: 'Nepal', code: 'NP', currency: 'NPR' },
    { name: 'Nicaragua', code: 'NI', currency: 'NIO' },
    { name: 'Niger', code: 'NE', currency: 'XOF' },
    { name: 'Niue', code: 'NU', currency: 'NZD' },
    { name: 'North Korea', code: 'KP', currency: 'KPW' },
    { name: 'North Macedonia', code: 'MK', currency: 'MKD' },
    { name: 'Northern Mariana Islands', code: 'MP', currency: 'USD' },
    { name: 'Oman', code: 'OM', currency: 'OMR' },
    { name: 'Pakistan', code: 'PK', currency: 'PKR' },
    { name: 'Palau', code: 'PW', currency: 'USD' },
    { name: 'Palestine', code: 'PS', currency: 'ILS' },
    { name: 'Panama', code: 'PA', currency: 'PAB' },
    { name: 'Papua New Guinea', code: 'PG', currency: 'PGK' },
    { name: 'Paraguay', code: 'PY', currency: 'PYG' },
    { name: 'Peru', code: 'PE', currency: 'PEN' },
    { name: 'Philippines', code: 'PH', currency: 'PHP' },
    { name: 'Pitcairn', code: 'PN', currency: 'NZD' },
    { name: 'Poland', code: 'PL', currency: 'PLN' },
    { name: 'Portugal', code: 'PT', currency: 'EUR' },
    { name: 'Puerto Rico', code: 'PR', currency: 'USD' },
    { name: 'Qatar', code: 'QA', currency: 'QAR' },
    { name: 'Réunion', code: 'RE', currency: 'EUR' },
    { name: 'Romania', code: 'RO', currency: 'RON' },
    { name: 'Rwanda', code: 'RW', currency: 'RWF' },
    { name: 'Saint Barthélemy', code: 'BL', currency: 'EUR' },
    { name: 'Saint Helena', code: 'SH', currency: 'SHP' },
    { name: 'Saint Kitts and Nevis', code: 'KN', currency: 'XCD' },
    { name: 'Saint Lucia', code: 'LC', currency: 'XCD' },
    { name: 'Saint Martin', code: 'MF', currency: 'EUR' },
    { name: 'Saint Pierre and Miquelon', code: 'PM', currency: 'EUR' },
    { name: 'Saint Vincent and the Grenadines', code: 'VC', currency: 'XCD' },
    { name: 'Samoa', code: 'WS', currency: 'WST' },
    { name: 'San Marino', code: 'SM', currency: 'EUR' },
    { name: 'São Tomé and Príncipe', code: 'ST', currency: 'STN' },
    { name: 'Senegal', code: 'SN', currency: 'XOF' },
    { name: 'Serbia', code: 'RS', currency: 'RSD' },
    { name: 'Seychelles', code: 'SC', currency: 'SCR' },
    { name: 'Sierra Leone', code: 'SL', currency: 'SLE' },
    { name: 'Slovakia', code: 'SK', currency: 'EUR' },
    { name: 'Slovenia', code: 'SI', currency: 'EUR' },
    { name: 'Solomon Islands', code: 'SB', currency: 'SBD' },
    { name: 'Somalia', code: 'SO', currency: 'SOS' },
    { name: 'South Georgia and South Sandwich Islands', code: 'GS', currency: 'GBP' },
    { name: 'South Sudan', code: 'SS', currency: 'SSP' },
    { name: 'Sri Lanka', code: 'LK', currency: 'LKR' },
    { name: 'Sudan', code: 'SD', currency: 'SDG' },
    { name: 'Suriname', code: 'SR', currency: 'SRD' },
    { name: 'Svalbard and Jan Mayen', code: 'SJ', currency: 'NOK' },
    { name: 'Syria', code: 'SY', currency: 'SYP' },
    { name: 'Taiwan', code: 'TW', currency: 'TWD' },
    { name: 'Tajikistan', code: 'TJ', currency: 'TJS' },
    { name: 'Tanzania', code: 'TZ', currency: 'TZS' },
    { name: 'Thailand', code: 'TH', currency: 'THB' },
    { name: 'Timor-Leste', code: 'TL', currency: 'USD' },
    { name: 'Togo', code: 'TG', currency: 'XOF' },
    { name: 'Tokelau', code: 'TK', currency: 'NZD' },
    { name: 'Tonga', code: 'TO', currency: 'TOP' },
    { name: 'Trinidad and Tobago', code: 'TT', currency: 'TTD' },
    { name: 'Tunisia', code: 'TN', currency: 'TND' },
    { name: 'Türkiye', code: 'TR', currency: 'TRY' },
    { name: 'Turkmenistan', code: 'TM', currency: 'TMT' },
    { name: 'Turks and Caicos Islands', code: 'TC', currency: 'USD' },
    { name: 'Tuvalu', code: 'TV', currency: 'AUD' },
    { name: 'Uganda', code: 'UG', currency: 'UGX' },
    { name: 'Ukraine', code: 'UA', currency: 'UAH' },
    { name: 'United States Minor Outlying Islands', code: 'UM', currency: 'USD' },
    { name: 'Uruguay', code: 'UY', currency: 'UYU' },
    { name: 'Uzbekistan', code: 'UZ', currency: 'UZS' },
    { name: 'Vanuatu', code: 'VU', currency: 'VUV' },
    { name: 'Venezuela', code: 'VE', currency: 'VES' },
    { name: 'Vietnam', code: 'VN', currency: 'VND' },
    { name: 'Virgin Islands, British', code: 'VG', currency: 'USD' },
    { name: 'Virgin Islands, U.S.', code: 'VI', currency: 'USD' },
    { name: 'Wallis and Futuna', code: 'WF', currency: 'XPF' },
    { name: 'Western Sahara', code: 'EH', currency: 'MAD' },
    { name: 'Yemen', code: 'YE', currency: 'YER' },
    { name: 'Zambia', code: 'ZM', currency: 'ZMW' },
    { name: 'Zimbabwe', code: 'ZW', currency: 'ZWG' }
  ];

  const currencyOptions = Array.from(new Set(countryOptions.map(c => c.currency)));

 function onCountryChange(e: Event) {
  const code = (e.target as HTMLSelectElement).value;
  const found = countryOptions.find(c => c.code === code);

  user.country = found ? found.name : '';
  user.currency = found ? found.currency : '';
}

  async function handleSignup(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    errorMsg = "";
    successMsg = "";

    const { error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          first_name: user.firstname,
          last_name: user.lastname,
          country: user.country,
          currency: user.currency,
          phone_number: user.phonenumber,
          address: user.address,
          dob: user.dob,
          admin: user.admin
        }
      }
    });

    if (error) {
      errorMsg = error.message;
      loading = false;
    } else {
      successMsg = "Check your email for the confirmation link.";
      loading = false;
      goto('/login', { replaceState: true });
    }
  }
</script>

<script lang="ts">
  import {
    ShieldCheck,
    ALargeSmall,
    Calendar,
    Phone,
    MapPin,
    Globe,
    Mail,
    Lock,
    Eye,
    Loader2,
    ArrowRight
  } from 'lucide-react-svelte';
  import { Label } from '$lib/components/ui/label';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';

  let loading = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');

  let user = $state({
    firstname: '',
    lastname: '',
    dob: '',
    phonenumber: '',
    address: '',
    country: '',
    currency: '',
    email: '',
    password: ''
  });

  const countryOptions = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' }
  ];

  const currencyOptions = ['USD', 'EUR', 'GBP', 'AUD', 'CAD'];

  function handleSignup(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    // Handle form submission logic
  }

  function onCountryChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    user.country = target.value;
  }
</script>

<div class="flex min-h-screen flex-col bg-[#05080a] font-sans text-slate-200">
  <!-- Main Content Split -->
  <main class="flex flex-1 flex-col-reverse md:flex-row">
    <!-- Left Section: Hero/Branding -->
    <section class="relative flex flex-1 flex-col justify-between overflow-hidden border-r border-slate-800/50 p-8 md:p-12">
      <!-- Background Glow/Effect -->
      <div class="absolute inset-0 bg-[url('/bg-trading-chart.jpg')] bg-cover bg-center opacity-20"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>

      <div class="relative z-10">
        <div class="mb-12 flex items-center gap-2 md:mb-16">
          <div class="rounded bg-blue-600 p-2">
            <ShieldCheck class="h-6 w-6 text-white" />
          </div>
          <a href="/"><span class="text-xl font-semibold italic tracking-tight">Premium-Pro-Trader</span></a>
        </div>

        <h1 class="mb-6 font-serif text-4xl font-medium leading-tight md:text-6xl">
          Create a Live Account.
        </h1>
        <p class="mb-12 max-w-md text-lg leading-relaxed text-slate-400">
          Access institutional-grade trading suite. Experience lightning-fast execution and deep liquidity in the world's most demanding markets.
        </p>

        <!-- Stats Grid -->
        <div class="grid max-w-sm grid-cols-2 gap-x-4 gap-y-10">
          <div>
            <div class="font-mono text-lg font-bold text-yellow-500">30ms</div>
            <div class="text-xs uppercase tracking-widest text-slate-500">Avg. Execution</div>
          </div>
          <div>
            <div class="font-mono text-lg font-bold text-yellow-500">300+</div>
            <div class="text-xs uppercase tracking-widest text-slate-500">Instruments</div>
          </div>
          <div>
            <div class="font-mono text-lg font-bold text-yellow-500">Deep</div>
            <div class="text-xs uppercase tracking-widest text-slate-500">Pool Liquidity</div>
          </div>
          <div>
            <div class="font-mono text-lg font-bold text-yellow-500">24/7</div>
            <div class="text-xs uppercase tracking-widest text-slate-500">Global Support</div>
          </div>
        </div>
      </div>

      <div class="relative z-10 mt-12 flex items-center gap-2 text-sm text-slate-500 md:mt-0">
        <ShieldCheck class="h-4 w-4" />
        <span>Military-grade encryption securing all transactions.</span>
      </div>
    </section>

    <!-- Right Section: Form -->
    <section class="flex flex-1 flex-col items-center justify-center bg-[#080c10] p-8 md:p-12">
      <div class="w-full max-w-md space-y-6">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-yellow-600">Institutional Access</span>
          <h2 class="mt-2 font-serif text-3xl font-medium md:text-4xl">Secure Sign Up</h2>
        </div>

        {#if errorMsg}
          <div class="rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
            {errorMsg}
          </div>
        {/if}

        {#if successMsg}
          <div class="rounded border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-500">
            {successMsg}
          </div>
        {/if}

        <form class="space-y-4" onsubmit={handleSignup}>
          <!-- Name Row -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="firstname" class="text-xs uppercase tracking-wider text-slate-500">First Name</Label>
              <div class="relative">
                <ALargeSmall class="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <Input 
                  id="firstname" 
                  type="text"
                  placeholder="First Name"
                  required
                  bind:value={user.firstname} 
                  class="h-12 border-slate-700 bg-slate-900/50 pl-10 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="lastname" class="text-xs uppercase tracking-wider text-slate-500">Last Name</Label>
              <div class="relative">
                <ALargeSmall class="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <Input 
                  id="lastname" 
                  type="text"
                  required
                  bind:value={user.lastname} 
                  placeholder="Last Name" 
                  class="h-12 border-slate-700 bg-slate-900/50 pl-10 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- DOB / Phone Row -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="dob" class="text-xs uppercase tracking-wider text-slate-500">Date of Birth</Label>
              <div class="relative">
                <Calendar class="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <Input 
                  id="dob" 
                  type="date"
                  required
                  bind:value={user.dob} 
                  class="h-12 border-slate-700 bg-slate-900/50 pl-10 text-slate-200 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="phone" class="text-xs uppercase tracking-wider text-slate-500">Phone Number</Label>
              <div class="relative">
                <Phone class="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <Input 
                  id="phone" 
                  required
                  bind:value={user.phonenumber} 
                  placeholder="+1 (555) 000-0000" 
                  type="tel"
                  class="h-12 border-slate-700 bg-slate-900/50 pl-10 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Address -->
          <div class="space-y-2">
            <Label for="address" class="text-xs uppercase tracking-wider text-slate-500">Residential Address</Label>
            <div class="relative">
              <MapPin class="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <Input 
                id="address" 
                type="text"
                placeholder="123 Financial District Way" 
                required
                bind:value={user.address} 
                class="h-12 border-slate-700 bg-slate-900/50 pl-10 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Country / Currency Row -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="country" class="text-xs uppercase tracking-wider text-slate-500">Country</Label>
              <div class="relative">
                <Globe class="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <select
                  id="country"
                  required
                  onchange={onCountryChange}
                  class="h-12 w-full rounded border border-slate-700 bg-slate-900/50 pl-10 pr-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled selected>Select country</option>
                  {#each countryOptions as c}
                    <option value={c.code} class="bg-slate-900 text-slate-200">{c.name}</option>
                  {/each}
                </select>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="currency" class="text-xs uppercase tracking-wider text-slate-500">Currency</Label>
              <div class="relative">
                <span class="absolute left-3.5 top-3.5 text-sm font-semibold text-slate-500">$</span>
                <select
                  id="currency"
                  bind:value={user.currency}
                  class="h-12 w-full rounded border border-slate-700 bg-slate-900/50 pl-10 pr-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled selected>Select currency</option>
                  {#each currencyOptions as cur}
                    <option value={cur} class="bg-slate-900 text-slate-200">{cur}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <Label for="email" class="text-xs uppercase tracking-wider text-slate-500">Terminal ID / Email</Label>
            <div class="relative">
              <Mail class="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <Input 
                id="email" 
                type="email"
                placeholder="name@firm.com" 
                required
                bind:value={user.email} 
                class="h-12 border-slate-700 bg-slate-900/50 pl-10 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <Label for="key" class="text-xs uppercase tracking-wider text-slate-500">Security Key</Label>
            <div class="relative">
              <Lock class="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <Input 
                id="key" 
                type="password" 
                placeholder="••••••••••••" 
                required
                bind:value={user.password} 
                class="h-12 border-slate-700 bg-slate-900/50 pl-10 pr-10"
              />
              <button type="button" class="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300">
                <Eye class="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} class="h-12 w-full gap-2 bg-blue-700 font-semibold text-white hover:bg-blue-600">
            {#if loading}
              <Loader2 class="h-4 w-4 animate-spin" /> Processing...
            {:else}
              Create Account <ArrowRight class="h-4 w-4" />
            {/if}
          </Button>
        </form>

        <div class="space-y-4 pt-4 text-center">
          <p class="text-sm text-slate-500">Already have an account?</p>
          <a href="/login" class="block w-full">
            <Button variant="outline" class="h-11 w-full border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white">
              Login
            </Button>
          </a>

          <div class="flex justify-center gap-6 pt-2">
            <div class="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500">
              <span class="h-2 w-2 rounded-full bg-blue-500"></span> Market: Open
            </div>
            <div class="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500">
              <span class="h-2 w-2 rounded-full bg-yellow-500"></span> Latency: 12ms
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-900 bg-[#040608] p-8">
    <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
      <p class="max-w-xl text-[10px] uppercase leading-relaxed tracking-tight text-slate-600">
        © 2024 Premium-pro-trader. Member FINRA/SIPC. High-risk investment notice: CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage.
      </p>
      <nav class="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <a href="/" class="hover:text-white">Privacy Policy</a>
        <a href="/" class="hover:text-white">Terms of Service</a>
        <a href="/" class="hover:text-white">Regulatory Status</a>
      </nav>
    </div>
  </footer>
</div>
