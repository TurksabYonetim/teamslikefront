import { useInitFlowbite } from "@/lib/flowbite";

/**
 * Flowbite "read.html" sayfasından birebir çevrildi.
 * tools/flowbite-to-jsx.mjs ile üretildi; markup elle değiştirilmez.
 */
export function MailRead() {
  useInitFlowbite();
  return (
    <>

      <div className="flex items-center justify-between border-b border-line bg-surface p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center">
          <div className="pe-3">
            <input id="checkbox-all" aria-describedby="checkbox-1" type="checkbox" className="checkbox" />
            <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
          </div>
          <div className="h-5 w-px bg-line dark:bg-gray-700"></div>
          <div className="flex space-x-1 px-2">
            <a href="#" data-tooltip-target="tooltip-archive" className="inline-flex cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4 4a2 2 0 1 0 0 4h16a2 2 0 1 0 0-4H4Zm0 6h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Zm10.7 5.7a1 1 0 0 0-1.4-1.4l-.3.3V12a1 1 0 1 0-2 0v2.6l-.3-.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l2-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Archive</span>
            </a>
            <div id="tooltip-archive" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Archive
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-spam" className="inline-flex cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Report Spam</span>
            </a>
            <div id="tooltip-spam" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Report Spam
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-delete" className="inline-flex cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M8.6 2.6A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4c0-.5.2-1 .6-1.4ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Delete</span>
            </a>
            <div id="tooltip-delete" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Delete
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </div>
          <div className="h-5 w-px bg-line dark:bg-gray-700"></div>
          <div className="flex space-x-1 px-0 sm:px-2">
            <a href="#" data-tooltip-target="tooltip-unread" className="hidden cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 5.6V18c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V5.6l-.9.7-7.9 6a2 2 0 0 1-2.4 0l-8-6-.8-.7Z" />
                <path d="M20.7 4.1A2 2 0 0 0 20 4H4a2 2 0 0 0-.6.1l.7.6 7.9 6 7.9-6 .8-.6Z" />
              </svg>
              <span className="sr-only">Mark as unread</span>
            </a>
            <div id="tooltip-unread" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Mark as unread
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-snooze" className="hidden cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v4c0 .3.1.5.3.7l3 3a1 1 0 0 0 1.4-1.4L13 11.6V8Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Snooze</span>
            </a>
            <div id="tooltip-snooze" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Snooze
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-add-to-tasks" className="hidden cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M18 14a1 1 0 1 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2v-2Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M15 21.5a10 10 0 1 1 3.6-17L10.9 12 7.7 8.9a1 1 0 0 0-1.4 1.4l4 4a1 1 0 0 0 1.3 0L20 5.8a10 10 0 0 1 1.6 9.1c-.4-.3-1-.5-1.5-.5h-.5V14a2.5 2.5 0 0 0-5 0v.5H14a2.5 2.5 0 0 0 0 5h.5v.5c0 .6.2 1.1.5 1.5Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Add to tasks</span>
            </a>
            <div id="tooltip-add-to-tasks" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Add to tasks
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-move" className="hidden cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M5 4a2 2 0 0 0-2 2v1h11l-2-2.3a2 2 0 0 0-1.5-.7H5ZM3 19V9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm11.7-7.7a1 1 0 0 0-1.4 1.4l.3.3H8a1 1 0 1 0 0 2h5.6l-.3.3a1 1 0 0 0 1.4 1.4l2-2c.4-.4.4-1 0-1.4l-2-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Move to</span>
            </a>
            <div id="tooltip-move" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Move to
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-labels" className="hidden cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M3 4a1 1 0 0 0-.822 1.57L6.632 12l-4.454 6.43A1 1 0 0 0 3 20h13.153a1 1 0 0 0 .822-.43l4.847-7a1 1 0 0 0 0-1.14l-4.847-7a1 1 0 0 0-.822-.43H3Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Labels</span>
            </a>
            <div id="tooltip-labels" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Labels
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <button id="mail-dropdown-button" type="button" aria-label="More actions" data-dropdown-toggle="mail-dropdown" className="inline-flex items-center rounded-lg p-2.5 text-center text-sm font-medium text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-line hover:text-ink focus-visible:ring-2 focus-visible:ring-brand dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="4" d="M12 6h0m0 6h0m0 6h0" />
              </svg>
            </button>
            <div id="mail-dropdown" className="z-10 hidden w-60 divide-y divide-line rounded-sm bg-surface shadow-sm origin-top-right motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:divide-gray-600 dark:bg-gray-700">
              <ul className="p-2 text-sm font-medium text-muted dark:text-gray-400" aria-labelledby="mail-dropdown-button">
                <li>
                  <a href="#" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-surface-2 hover:text-ink dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="me-1.5 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M3 4a1 1 0 0 0-.822 1.57L6.632 12l-4.454 6.43A1 1 0 0 0 3 20h13.153a1 1 0 0 0 .822-.43l4.847-7a1 1 0 0 0 0-1.14l-4.847-7a1 1 0 0 0-.822-.43H3Z" clipRule="evenodd" />
                    </svg>
                    Mark as Important
                  </a>
                </li>
                <li>
                  <a href="#" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-surface-2 hover:text-ink dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" d="M11 5.1a1 1 0 0 1 2 0l1.7 4c.1.4.4.6.8.6l4.5.4a1 1 0 0 1 .5 1.7l-3.3 2.8a1 1 0 0 0-.3 1l1 4a1 1 0 0 1-1.5 1.2l-3.9-2.3a1 1 0 0 0-1 0l-4 2.3a1 1 0 0 1-1.4-1.1l1-4.1c.1-.4 0-.8-.3-1l-3.3-2.8a1 1 0 0 1 .5-1.7l4.5-.4c.4 0 .7-.2.8-.6l1.8-4Z" />
                    </svg>
                    Add star
                  </a>
                </li>
                <li>
                  <a href="#" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-surface-2 hover:text-ink dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 3a2 2 0 0 0-1.5 3.3l5.4 6v5c0 .4.3.9.6 1.1l3.1 2.3c1 .7 2.5 0 2.5-1.2v-7.1l5.4-6C21.6 5 20.7 3 19 3H5Z" />
                    </svg>
                    Filter messages like these
                  </a>
                </li>
                <li>
                  <a href="#" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-surface-2 hover:text-ink dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8" />
                    </svg>
                    Forward as attachment
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-y-0">
          <span className="me-4 hidden text-sm text-muted dark:text-gray-400 sm:flex">Show <span className="mx-1 font-semibold text-ink dark:text-white">1-25</span> of <span className="ms-1 font-semibold text-ink dark:text-white">2290</span></span>
          <a href="#" data-tooltip-target="tooltip-prev-page" className="inline-flex cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7" />
            </svg>
            <span className="sr-only">Prev page</span>
          </a>
          <div id="tooltip-prev-page" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            Prev page
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          <a href="#" data-tooltip-target="tooltip-next-page" className="inline-flex cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7" />
            </svg>
            <span className="sr-only">Next page</span>
          </a>
          <div id="tooltip-next-page" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            Next page
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>
      </div>
      <div className="p-4 lg:px-8">
        <div className="mb-4 items-center justify-between border-b border-line pb-4 dark:border-gray-800">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-line pb-4 dark:border-gray-800">
            <h2 className="min-w-0 break-words text-base font-semibold text-ink dark:text-white sm:mb-1.5 sm:flex sm:text-xl sm:leading-none">
              Inquiry about design services <span className="me-2 ms-3 hidden rounded-sm bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 sm:flex">External</span>
            </h2>
            <div className="flex shrink-0 items-center space-x-1">
              <a href="#" data-tooltip-target="tooltip-print" className="inline-flex cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M8 3a2 2 0 0 0-2 2v3h12V5a2 2 0 0 0-2-2H8Zm-3 7a2 2 0 0 0-2 2v5c0 1.1.9 2 2 2h1v-4c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v4h1a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5Zm4 11a1 1 0 0 1-1-1v-4h8v4c0 .6-.4 1-1 1H9Z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Print</span>
              </a>
              <div id="tooltip-print" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Print
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-new-window" className="inline-flex cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M11.4 5H5a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-6.4a3 3 0 0 1-1.7-1.6l-3 3A3 3 0 1 1 10 9.8l3-3A3 3 0 0 1 11.4 5Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M13.2 4c0-.6.5-1 1-1H20c.6 0 1 .4 1 1v5.8a1 1 0 1 1-2 0V6.4l-6.2 6.2a1 1 0 0 1-1.4-1.4L17.6 5h-3.4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">In new window</span>
              </a>
              <div id="tooltip-new-window" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                In new window
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-4">
              <img className="h-10 w-10 shrink-0 rounded-full" src="/images/users/avatar-4.png" alt="Avatar" />
              <div className="min-w-0 font-semibold dark:text-white">
                <div>Contact</div>
                <button id="mailDetailsDropdownButton" type="button" data-dropdown-toggle="mailDetailsDropdown" className="inline-flex items-center text-sm font-medium text-muted hover:text-ink dark:text-gray-400 dark:hover:text-white">
                  to Flowbite Support, me
                  <svg className="ms-1 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M18.4 10.3A2 2 0 0 0 17 7H7a2 2 0 0 0-1.5 3.3l4.9 5.9a2 2 0 0 0 3 0l5-6Z" clipRule="evenodd" />
                  </svg>
                </button>
                <div id="mailDetailsDropdown" className="z-50 hidden w-[min(360px,90vw)] rounded-sm bg-surface p-4 shadow-sm origin-top-left motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:bg-gray-700">
                  <ul className="space-y-2 text-sm font-normal" aria-labelledby="mailDetailsDropdownButton">
                    <li className="flex items-center text-muted dark:text-gray-400">
                      <div className="w-16">From:</div>
                      <div className="ms-1 text-ink dark:text-gray-400">Joseph (name@example.com)</div>
                    </li>
                    <li className="flex items-center text-muted dark:text-gray-400">
                      <div className="w-16">To:</div>
                      <div className="ms-1 text-ink dark:text-gray-400">name@company.com</div>
                    </li>
                    <li className="flex items-center text-muted dark:text-gray-400">
                      <div className="w-16">Date:</div>
                      <time className="ms-1 text-ink dark:text-gray-400" dateTime="2025-02-06 10:19">Feb 6, 2025, 10:19AM </time>
                    </li>
                    <li className="flex items-center text-muted dark:text-gray-400">
                      <div className="w-16">Subject:</div>
                      <div className="ms-1 text-ink dark:text-gray-400">I need help with my purchase</div>
                    </li>
                    <li className="flex items-center text-muted dark:text-gray-400">
                      <div className="w-16">Security:</div>
                      <div className="ms-1 text-ink dark:text-gray-400">Standard encryption (TLS) <a className="font-medium text-ink underline hover:no-underline dark:text-white" href="#">Learn more</a></div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center">
              <p className="me-4 hidden text-xs text-muted dark:text-gray-400 sm:flex sm:text-sm">Mon,<time dateTime="2025-07-31 15:20">Jul 31, 3:20 PM</time> (2 hours ago)</p>
              <a href="#" data-tooltip-target="tooltip-favorites" className="inline-flex cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2" d="M11 5.1a1 1 0 0 1 2 0l1.7 4c.1.4.4.6.8.6l4.5.4a1 1 0 0 1 .5 1.7l-3.3 2.8a1 1 0 0 0-.3 1l1 4a1 1 0 0 1-1.5 1.2l-3.9-2.3a1 1 0 0 0-1 0l-4 2.3a1 1 0 0 1-1.4-1.1l1-4.1c.1-.4 0-.8-.3-1l-3.3-2.8a1 1 0 0 1 .5-1.7l4.5-.4c.4 0 .7-.2.8-.6l1.8-4Z" />
                </svg>
                <span className="sr-only">Favorites</span>
              </a>
              <div id="tooltip-favorites" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Add to favorites
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-reply" className="inline-flex cursor-pointer justify-center rounded-lg p-2.5 text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.5 8H11V6.1c0-.9-.9-1.4-1.5-.9L4.4 9.7a1.2 1.2 0 0 0 0 1.8l5 4.4c.7.6 1.6 0 1.6-.8v-2h2a3 3 0 0 1 3 3V19a5.6 5.6 0 0 0-1.5-11Z" />
                </svg>
                <span className="sr-only">Reply</span>
              </a>
              <div id="tooltip-reply" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Reply
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            </div>
          </div>
        </div>
        <article>
          <p className="mt-6 text-ink-2 dark:text-gray-400">Dear Flowbite team,</p>
          <p className="mt-6 text-ink-2 dark:text-gray-400">
            I hope this email finds you well. My name is Jospeh McFallen, and I am reaching out to inquire about the design services offered by your esteemed company. I came across your portfolio and was truly impressed by the innovative and
            captivating designs showcased.
          </p>
          <p className="mt-6 text-ink-2 dark:text-gray-400">
            I am currently in the process of launching a Flowbite APP and believe that a distinctive and creative design is essential for setting the right tone and establishing a strong brand presence. Your expertise in this field caught my
            attention, and I am keen to explore the possibility of collaborating with your talented team.
          </p>
          <p className="mb-4 mt-6 text-ink-2 dark:text-gray-400">Here are some specific points I would like to discuss:</p>
          <ol className="list-inside list-decimal space-y-4 text-ink-2 dark:text-gray-400">
            <li>
              <span className="font-medium text-ink dark:text-white">Brand Identity:</span> I am interested in creating a unique brand identity that resonates with our target audience. This includes logo design, color palette selection, and
              other visual elements that can effectively communicate our mission and values.
            </li>
            <li>
              <span className="font-medium text-ink dark:text-white">Website Design:</span> As our digital storefront, the website needs to be user-friendly, visually engaging, and reflective of our brand identity. I would like to explore your
              approach to web design and understand how we can create an immersive online experience for our visitors.
            </li>
            <li>
              <span className="font-medium text-ink dark:text-white">Print Collateral:</span> We also require various print materials, such as business cards, brochures, and promotional materials. I would love to see examples of your print
              design work and discuss how we can make a lasting impact through these materials.
            </li>
            <li>
              <span className="font-medium text-ink dark:text-white">Packaging Design:</span> Since our product(s) will be an integral part of our brand, we aim to have packaging that is not only aesthetically pleasing but also functional and
              environmentally friendly. I am curious to know about your experience in creating standout packaging designs.
            </li>
            <li>
              <span className="font-medium text-ink dark:text-white">Packaging Design:</span> Since our product(s) will be an integral part of our brand, we aim to have packaging that is not only aesthetically pleasing but also functional and
              environmentally friendly. I am curious to know about your experience in creating standout packaging designs.
            </li>
            <li>
              <span className="font-medium text-ink dark:text-white">Timeline and Pricing:</span> Understanding the timeline and cost of your services is crucial for our planning process. I would appreciate it if you could provide some insights
              into your typical project timelines and your pricing structure.
            </li>
          </ol>
          <p className="mt-6 text-ink-2 dark:text-gray-400">
            I am eager to explore the potential of working together and believe that your creative vision aligns perfectly with our project goals. Your portfolio speaks volumes about your talent, and I am excited about the prospect of bringing
            fresh, imaginative ideas to life with your team.
          </p>
          <p className="mt-6 text-ink-2 dark:text-gray-400">
            Please let me know if you would be available for a brief call or meeting to further discuss our requirements and explore the possibilities of collaboration. I am confident that together, we can create something exceptional that leaves
            a lasting impression on our audience.
          </p>
          <p className="mt-6 text-ink-2 dark:text-gray-400">Looking forward to your positive response.</p>
          <p className="mt-6 text-ink-2 dark:text-gray-400">
            Best regards,<br />
            Joseph McFall, CEO & Founder Digital Things LLC
          </p>
        </article>
      </div>
      <div className="mt-2 mb-4 flex items-center space-x-4 px-4 lg:px-8">
        <a href="" className="inline-flex items-center rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-brand-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-line dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
          <svg className="-ms-2 me-2 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.5 8H11V6.1c0-.9-.9-1.4-1.5-.9L4.4 9.7a1.2 1.2 0 0 0 0 1.8l5 4.4c.7.6 1.6 0 1.6-.8v-2h2a3 3 0 0 1 3 3V19a5.6 5.6 0 0 0-1.5-11Z" />
          </svg>
          Reply
        </a>
        <a href="" className="inline-flex items-center rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-brand-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-line dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
          <svg className="-ms-2 me-2 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.8 6-5.6 5a1 1 0 0 0 0 1.5l5.7 5m5.7-3.1V16a1 1 0 0 1-1.5.8l-5.2-4.2a1.1 1.1 0 0 1 0-1.7l5.2-4.2a1 1 0 0 1 1.5.8v1.7c3.3 0 6 3 6 6.7v1.3a.7.7 0 0 1-1.4.4 5.2 5.2 0 0 0-4.6-3.2h0Z" />
          </svg>
          Reply all
        </a>
        <a href="" className="inline-flex items-center rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-surface-2 hover:text-brand-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-line dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
          <svg className="-ms-2 me-2 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.2 19c-1-3.2 1-10.8 8.3-10.8V6.1a1 1 0 0 1 1.6-.9l5.5 4.3a1.1 1.1 0 0 1 0 1.7L14 15.6a1 1 0 0 1-1.6-1v-2c-7.2 1-8.3 6.4-8.3 6.4Z" />
          </svg>
          Forward
        </a>
      </div>

    </>
  );
}
