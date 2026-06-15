import { useInitFlowbite } from "@/lib/flowbite";

/**
 * Flowbite "reply.html" sayfasından birebir çevrildi.
 * tools/flowbite-to-jsx.mjs ile üretildi; markup elle değiştirilmez.
 */
export function MailReply() {
  useInitFlowbite();
  return (
    <>

      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center">
          <div className="pr-3">
            <input id="checkbox-all" aria-describedby="checkbox-1" type="checkbox" className="focus:ring-3 h-4 w-4 rounded-sm border-gray-300 bg-gray-50 focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600" />
            <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
          </div>
          <div className="h-5 w-px bg-gray-100 dark:bg-gray-700"></div>
          <div className="flex space-x-1 px-2">
            <a href="#" data-tooltip-target="tooltip-archive" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4 4a2 2 0 1 0 0 4h16a2 2 0 1 0 0-4H4Zm0 6h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Zm10.7 5.7a1 1 0 0 0-1.4-1.4l-.3.3V12a1 1 0 1 0-2 0v2.6l-.3-.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l2-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Archive</span>
            </a>
            <div id="tooltip-archive" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Archive
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-spam" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Report Spam</span>
            </a>
            <div id="tooltip-spam" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Report Spam
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-delete" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
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
          <div className="h-5 w-px bg-gray-100 dark:bg-gray-700"></div>
          <div className="flex space-x-1 px-0 sm:px-2">
            <a href="#" data-tooltip-target="tooltip-unread" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
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
            <a href="#" data-tooltip-target="tooltip-snooze" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v4c0 .3.1.5.3.7l3 3a1 1 0 0 0 1.4-1.4L13 11.6V8Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Snooze</span>
            </a>
            <div id="tooltip-snooze" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Snooze
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-add-to-tasks" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
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
            <a href="#" data-tooltip-target="tooltip-move" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M5 4a2 2 0 0 0-2 2v1h11l-2-2.3a2 2 0 0 0-1.5-.7H5ZM3 19V9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm11.7-7.7a1 1 0 0 0-1.4 1.4l.3.3H8a1 1 0 1 0 0 2h5.6l-.3.3a1 1 0 0 0 1.4 1.4l2-2c.4-.4.4-1 0-1.4l-2-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Move to</span>
            </a>
            <div id="tooltip-move" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Move to
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-labels" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M3 4a1 1 0 0 0-.822 1.57L6.632 12l-4.454 6.43A1 1 0 0 0 3 20h13.153a1 1 0 0 0 .822-.43l4.847-7a1 1 0 0 0 0-1.14l-4.847-7a1 1 0 0 0-.822-.43H3Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Labels</span>
            </a>
            <div id="tooltip-labels" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Labels
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <button id="mail-dropdown-button" type="button" data-dropdown-toggle="mail-dropdown" className="inline-flex items-center rounded-lg p-2 text-center text-sm font-medium text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-200 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="4" d="M12 6h0m0 6h0m0 6h0" />
              </svg>
            </button>
            <div id="mail-dropdown" className="z-10 hidden w-60 origin-top-right divide-y divide-gray-100 rounded-sm bg-white shadow-sm motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:divide-gray-600 dark:bg-gray-700">
              <ul className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400" aria-labelledby="mail-dropdown-button">
                <li>
                  <a href="#" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="me-1.5 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M3 4a1 1 0 0 0-.822 1.57L6.632 12l-4.454 6.43A1 1 0 0 0 3 20h13.153a1 1 0 0 0 .822-.43l4.847-7a1 1 0 0 0 0-1.14l-4.847-7a1 1 0 0 0-.822-.43H3Z" clipRule="evenodd" />
                    </svg>
                    Mark as Important
                  </a>
                </li>
                <li>
                  <a href="#" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" d="M11 5.1a1 1 0 0 1 2 0l1.7 4c.1.4.4.6.8.6l4.5.4a1 1 0 0 1 .5 1.7l-3.3 2.8a1 1 0 0 0-.3 1l1 4a1 1 0 0 1-1.5 1.2l-3.9-2.3a1 1 0 0 0-1 0l-4 2.3a1 1 0 0 1-1.4-1.1l1-4.1c.1-.4 0-.8-.3-1l-3.3-2.8a1 1 0 0 1 .5-1.7l4.5-.4c.4 0 .7-.2.8-.6l1.8-4Z" />
                    </svg>
                    Add star
                  </a>
                </li>
                <li>
                  <a href="#" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 3a2 2 0 0 0-1.5 3.3l5.4 6v5c0 .4.3.9.6 1.1l3.1 2.3c1 .7 2.5 0 2.5-1.2v-7.1l5.4-6C21.6 5 20.7 3 19 3H5Z" />
                    </svg>
                    Filter messages like these
                  </a>
                </li>
                <li>
                  <a href="#" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
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
          <span className="me-4 hidden text-sm text-gray-500 dark:text-gray-400 sm:flex">Show <span className="mx-1 font-semibold text-gray-900 dark:text-white">1-25</span> of <span className="ms-1 font-semibold text-gray-900 dark:text-white">2290</span></span>
          <a href="#" data-tooltip-target="tooltip-prev-page" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7" />
            </svg>
            <span className="sr-only">Prev page</span>
          </a>
          <div id="tooltip-prev-page" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            Prev page
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          <a href="#" data-tooltip-target="tooltip-next-page" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
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
      <div className="p-4 xl:p-8">
        <div className="mb-4 items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
            <h2 className="text-base font-medium text-gray-900 dark:text-white sm:mb-1.5 sm:flex sm:text-xl sm:leading-none">
              RE: Inquiry about design services <span className="me-2 ms-3 hidden rounded-sm bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 sm:flex">External</span>
            </h2>
            <div className="flex items-center space-x-1">
              <a href="#" data-tooltip-target="tooltip-print" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M8 3a2 2 0 0 0-2 2v3h12V5a2 2 0 0 0-2-2H8Zm-3 7a2 2 0 0 0-2 2v5c0 1.1.9 2 2 2h1v-4c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v4h1a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5Zm4 11a1 1 0 0 1-1-1v-4h8v4c0 .6-.4 1-1 1H9Z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Print</span>
              </a>
              <div id="tooltip-print" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Print
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-new-window" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
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
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <img className="h-10 w-10 rounded-full" src="/images/users/avatar-4.png" alt="Avatar" />
              <div className="font-semibold dark:text-white">
                <div>Contact</div>
                <button id="mailDetailsDropdownButton" type="button" data-dropdown-toggle="mailDetailsDropdown" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  to Flowbite Support, me
                  <svg className="ms-1 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M18.4 10.3A2 2 0 0 0 17 7H7a2 2 0 0 0-1.5 3.3l4.9 5.9a2 2 0 0 0 3 0l5-6Z" clipRule="evenodd" />
                  </svg>
                </button>
                <div id="mailDetailsDropdown" className="z-50 hidden w-[360px] origin-top-left rounded-sm bg-white p-4 shadow-sm motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:bg-gray-700">
                  <ul className="space-y-2 text-sm font-normal" aria-labelledby="mailDetailsDropdownButton">
                    <li className="flex items-center text-gray-500 dark:text-gray-400">
                      <div className="w-16">From:</div>
                      <div className="ms-1 text-gray-900 dark:text-gray-400">Joseph (name@example.com)</div>
                    </li>
                    <li className="flex items-center text-gray-500 dark:text-gray-400">
                      <div className="w-16">To:</div>
                      <div className="ms-1 text-gray-900 dark:text-gray-400">name@company.com</div>
                    </li>
                    <li className="flex items-center text-gray-500 dark:text-gray-400">
                      <div className="w-16">Date:</div>
                      <time className="ms-1 text-gray-900 dark:text-gray-400" dateTime="2025-02-06 10:19">Feb 6, 2025, 10:19AM </time>
                    </li>
                    <li className="flex items-center text-gray-500 dark:text-gray-400">
                      <div className="w-16">Subject:</div>
                      <div className="ms-1 text-gray-900 dark:text-gray-400">I need help with my purchase</div>
                    </li>
                    <li className="flex items-center text-gray-500 dark:text-gray-400">
                      <div className="w-16">Security:</div>
                      <div className="ms-1 text-gray-900 dark:text-gray-400">Standard encryption (TLS) <a className="font-medium text-gray-900 underline hover:no-underline dark:text-white" href="#">Learn more</a></div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <p className="me-4 hidden text-xs text-gray-500 dark:text-gray-400 sm:flex sm:text-sm">Mon,<time dateTime="2025-07-31 15:20">Jul 31, 3:20 PM</time> (2 hours ago)</p>
              <a href="#" data-tooltip-target="tooltip-favorites" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2" d="M11 5.1a1 1 0 0 1 2 0l1.7 4c.1.4.4.6.8.6l4.5.4a1 1 0 0 1 .5 1.7l-3.3 2.8a1 1 0 0 0-.3 1l1 4a1 1 0 0 1-1.5 1.2l-3.9-2.3a1 1 0 0 0-1 0l-4 2.3a1 1 0 0 1-1.4-1.1l1-4.1c.1-.4 0-.8-.3-1l-3.3-2.8a1 1 0 0 1 .5-1.7l4.5-.4c.4 0 .7-.2.8-.6l1.8-4Z" />
                </svg>
                <span className="sr-only">Favorites</span>
              </a>
              <div id="tooltip-favorites" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Add to favorites
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-reply" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
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
          <p className="mt-6 text-gray-500 dark:text-gray-400">Dear Flowbite team,</p>
          <p className="mt-6 text-gray-500 dark:text-gray-400">
            I hope this email finds you well. My name is Jospeh McFallen, and I am reaching out to inquire about the design services offered by your esteemed company. I came across your portfolio and was truly impressed by the innovative and
            captivating designs showcased.
          </p>
          <p className="mt-6 text-gray-500 dark:text-gray-400">
            I am currently in the process of launching a Flowbite APP and believe that a distinctive and creative design is essential for setting the right tone and establishing a strong brand presence. Your expertise in this field caught my
            attention, and I am keen to explore the possibility of collaborating with your talented team.
          </p>
          <p className="mb-4 mt-6 text-gray-500 dark:text-gray-400">Here are some specific points I would like to discuss:</p>
          <ol className="list-inside list-decimal space-y-4 text-gray-500 dark:text-gray-400">
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Brand Identity:</span> I am interested in creating a unique brand identity that resonates with our target audience. This includes logo design, color palette selection, and
              other visual elements that can effectively communicate our mission and values.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Website Design:</span> As our digital storefront, the website needs to be user-friendly, visually engaging, and reflective of our brand identity. I would like to explore your
              approach to web design and understand how we can create an immersive online experience for our visitors.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Print Collateral:</span> We also require various print materials, such as business cards, brochures, and promotional materials. I would love to see examples of your print
              design work and discuss how we can make a lasting impact through these materials.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Packaging Design:</span> Since our product(s) will be an integral part of our brand, we aim to have packaging that is not only aesthetically pleasing but also functional and
              environmentally friendly. I am curious to know about your experience in creating standout packaging designs.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Packaging Design:</span> Since our product(s) will be an integral part of our brand, we aim to have packaging that is not only aesthetically pleasing but also functional and
              environmentally friendly. I am curious to know about your experience in creating standout packaging designs.
            </li>
            <li>
              <span className="font-medium text-gray-900 dark:text-white">Timeline and Pricing:</span> Understanding the timeline and cost of your services is crucial for our planning process. I would appreciate it if you could provide some insights
              into your typical project timelines and your pricing structure.
            </li>
          </ol>
          <p className="mt-6 text-gray-500 dark:text-gray-400">
            I am eager to explore the potential of working together and believe that your creative vision aligns perfectly with our project goals. Your portfolio speaks volumes about your talent, and I am excited about the prospect of bringing
            fresh, imaginative ideas to life with your team.
          </p>
          <p className="mt-6 text-gray-500 dark:text-gray-400">
            Please let me know if you would be available for a brief call or meeting to further discuss our requirements and explore the possibilities of collaboration. I am confident that together, we can create something exceptional that leaves
            a lasting impression on our audience.
          </p>
          <p className="mt-6 text-gray-500 dark:text-gray-400">Looking forward to your positive response.</p>
          <p className="mt-6 text-gray-500 dark:text-gray-400">
            Best regards,<br />
            Joseph McFall, CEO & Founder Digital Things LLC
          </p>
        </article>
        <form className="mt-6 rounded-lg border border-gray-200 bg-white motion-safe:[animation:tl-fade-in_var(--dur-modal)_var(--ease-out)] dark:border-gray-700 dark:bg-gray-800">
          <div className="w-full">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-2">
                <button id="messageDropdownButton" data-dropdown-toggle="messageDropdown" className="flex items-center justify-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-200 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-50 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-600" type="button">
                  Reply
                  <svg className="-me-0.5 ms-1.5 h-3.5 w-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                  </svg>
                </button>
                {/* Dropdown menu */}
                <div id="messageDropdown" className="z-10 hidden w-36 origin-top-left rounded-lg bg-white p-2 shadow-sm motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:bg-gray-700">
                  <ul className="space-y-1 text-sm font-medium" aria-labelledby="messageDropdownButton">
                    <li>
                      <button type="button" className="flex w-full rounded-sm px-3 py-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" href="#">Reply</button>
                    </li>
                    <li>
                      <button type="button" className="flex w-full rounded-sm px-3 py-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" href="#">Forward</button>
                    </li>
                    <li>
                      <button type="button" className="flex w-full rounded-sm px-3 py-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" href="#">Edit subject</button>
                    </li>
                    <li>
                      <button type="button" className="flex w-full rounded-sm px-3 py-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" href="#">Pop out reply</button>
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Joseph McFallen (name@example.com)</p>
              </div>
              <button type="button" data-tooltip-target="tooltip-fullscreen" className="cursor-pointer rounded-sm p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:ms-auto">
                <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 19 19">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 1h5m0 0v5m0-5-5 5M1.979 6V1H7m0 16.042H1.979V12M18 12v5.042h-5M13 12l5 5M2 1l5 5m0 6-5 5" />
                </svg>
                <span className="sr-only">Full screen</span>
              </button>
              <div id="tooltip-fullscreen" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Show full screen
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            </div>
            <div className="rounded-b-lg bg-white px-4 py-2 dark:bg-gray-800">
              <label htmlFor="editor" className="sr-only">Publish post</label>
              <textarea id="editor" rows={8} autoFocus className="block w-full border-0 bg-white px-0 text-sm text-gray-800 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400" placeholder="" required></textarea>
            </div>
          </div>
          <div className="flex flex-wrap items-center divide-gray-200 rounded-b-lg border-t border-gray-200 px-4 py-3 dark:divide-gray-700 dark:border-gray-700 sm:divide-x sm:rtl:divide-x-reverse">
            <div className="flex flex-wrap items-center space-x-0.5 sm:pe-4 rtl:space-x-reverse">
              <a href="#" data-tooltip-target="tooltip-undo" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h13a5 5 0 0 1 0 10H7M3 9l4-4M3 9l4 4" />
                </svg>
                <span className="sr-only">Undo</span>
              </a>
              <div id="tooltip-undo" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Undo
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-redo" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 9H8a5 5 0 0 0 0 10h9m4-10-4-4m4 4-4 4" />
                </svg>
                <span className="sr-only">Redo</span>
              </a>
              <div id="tooltip-redo" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Redo
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <button id="filterDropdownButton" data-dropdown-toggle="filterDropdown" data-dropdown-ignore-click-outside-class="datepicker" className="flex items-center justify-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-200 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-50 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-600" type="button">
                Arial (Sans-serif)
                <svg className="-me-0.5 ms-1.5 h-3.5 w-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                </svg>
              </button>
              {/* Dropdown menu */}
              <div id="filterDropdown" className="z-10 hidden w-56 origin-top-left rounded-lg bg-white p-2 shadow-sm motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:bg-gray-700">
                <ul className="space-y-1 text-sm font-medium" aria-labelledby="filterDropdownButton">
                  <li>
                    <button type="button" className="flex w-full rounded-sm px-3 py-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">Arial (Sans-serif)</button>
                  </li>
                  <li>
                    <button type="button" className="flex w-full rounded-sm px-3 py-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">Times New Roman (Serif)</button>
                  </li>
                  <li>
                    <button type="button" className="flex w-full rounded-sm px-3 py-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">Helvetica (Sans-serif)</button>
                  </li>
                  <li>
                    <button type="button" className="flex w-full rounded-sm px-3 py-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">Verdana (Sans-serif)</button>
                  </li>
                  <li>
                    <button type="button" className="flex w-full rounded-sm px-3 py-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">Georgia (Sans-serif)</button>
                  </li>
                  <li>
                    <button type="button" className="flex w-full rounded-sm px-3 py-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">Roboto (Sans-serif)</button>
                  </li>
                </ul>
              </div>
              <a href="#" data-tooltip-target="tooltip-text-size" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3" />
                </svg>
                <span className="sr-only">Text size</span>
              </a>
              <div id="tooltip-text-size" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Text size
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-font-bold" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5h4.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0-7H6m2 7h6.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0 0H6" />
                </svg>
                <span className="sr-only">Bold</span>
              </a>
              <div id="tooltip-font-bold" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Bold
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-font-italic" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.9 19 15 5M6 19h6.3m-.6-14H18" />
                </svg>
                <span className="sr-only">Italic</span>
              </a>
              <div id="tooltip-font-italic" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Italic
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-font-underline" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M6 19h12M8 5v9a4 4 0 0 0 8 0V5M6 5h4m4 0h4" />
                </svg>
                <span className="sr-only">Underline</span>
              </a>
              <div id="tooltip-font-underline" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Underline
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-text-slash" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 6.2V5h12v1.2M7 19h6m.2-14-1.7 6.5M9.6 19l1-4M5 5l6.5 6.5M19 19l-7.5-7.5" />
                </svg>
                <span className="sr-only">Text slash</span>
              </a>
              <div id="tooltip-text-slash" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Text slash
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-paragraph" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v7m0 7v-7m4-7v14m3-14H8.5C6.5 5 5 6.6 5 8.5v0c0 2 1.6 3.5 3.5 3.5H12" />
                </svg>
                <span className="sr-only">Paragraph</span>
              </a>
              <div id="tooltip-paragraph" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Paragraph
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            </div>
            <div className="hidden flex-wrap items-center space-x-1 sm:ps-4 md:flex rtl:space-x-reverse">
              <a href="#" data-tooltip-target="tooltip-quote" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M6 6a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h3a3 3 0 0 1-3 3H5a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2H6Zm9 0a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h3a3 3 0 0 1-3 3h-1a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3Z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Quote</span>
              </a>
              <div id="tooltip-quote" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Quote
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-text-center" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h8M6 10h12M8 14h8M6 18h12" />
                </svg>
                <span className="sr-only">Text center</span>
              </a>
              <div id="tooltip-text-center" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Text center
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-ordered-list" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6h8m-8 6h8m-8 6h8M4 16a2 2 0 1 1 3.3 1.5L4 20h5M4 5l2-1v6m-2 0h4" />
                </svg>
                <span className="sr-only">Ordered list</span>
              </a>
              <div id="tooltip-ordered-list" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Ordered list
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-list" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M9 8h10M9 12h10M9 16h10M5 8h0m0 4h0m0 4h0" />
                </svg>
                <span className="sr-only">List</span>
              </a>
              <div id="tooltip-list" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                List
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-text-indent" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6h12M6 18h12m-5-8h5m-5 4h5M6 9v6l3.5-3L6 9Z" />
                </svg>
                <span className="sr-only">Text indent</span>
              </a>
              <div id="tooltip-text-indent" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Text indent
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <a href="#" data-tooltip-target="tooltip-text-outdent" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6h12M6 18h12m-5-8h5m-5 4h5M9.5 9v6L6 12l3.5-3Z" />
                </svg>
                <span className="sr-only">Text outdent</span>
              </a>
              <div id="tooltip-text-outdent" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                Text outdent
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            </div>
          </div>
          <div className="items-center space-x-0.5 rounded-b-lg border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex">
            <button type="button" className="mb-4 me-2 inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-center text-sm font-medium text-white transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:mb-0 sm:w-auto">
              <svg className="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2c.4 0 .8.3 1 .6l7 18a1 1 0 0 1-1.4 1.3L13 19.5V13a1 1 0 1 0-2 0v6.5L5.4 22A1 1 0 0 1 4 20.6l7-18a1 1 0 0 1 1-.6Z" clipRule="evenodd" />
              </svg>
              Send message
            </button>
            <a href="#" data-tooltip-target="tooltip-attach-file" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8" />
              </svg>
              <span className="sr-only">Attach file</span>
            </a>
            <div id="tooltip-attach-file" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Attach file
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-location" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2a8 8 0 0 1 6.6 12.6l-.1.1-.6.7-5.1 6.2a1 1 0 0 1-1.6 0L6 15.3l-.3-.4-.2-.2v-.2A8 8 0 0 1 11.8 2Zm3 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Location</span>
            </a>
            <div id="tooltip-location" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Location
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-emoji" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm5.5 1a.5.5 0 0 0-1 0 5 5 0 0 0 1.6 3.4 5.5 5.5 0 0 0 7.8 0 5 5 0 0 0 1.6-3.4.5.5 0 0 0-1 0h-.2l-1 .3a18.9 18.9 0 0 1-7.8-.4ZM9 8a1 1 0 0 0 0 2 1 1 0 1 0 0-2Zm6 0a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Emoji</span>
            </a>
            <div id="tooltip-emoji" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Emoji
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-insert-photo" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M9 2.2V7H4.2l.4-.5 3.9-4 .5-.3Zm2-.2v5a2 2 0 0 1-2 2H4v11c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Zm.4 9.6a1 1 0 0 0-1.8 0l-2.5 6A1 1 0 0 0 8 19h8a1 1 0 0 0 .9-1.4l-2-4a1 1 0 0 0-1.7-.2l-.5.7-1.3-2.5ZM13 9.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Insert photo</span>
            </a>
            <div id="tooltip-insert-photo" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Insert photo
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-confidential-mode" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M10 5a2 2 0 0 0-2 2v3h2.4a7.5 7.5 0 0 0 0 11H5a2 2 0 0 1-2-2v-7c0-1.1.9-2 2-2h1V7a4 4 0 1 1 8 0v1.2c-.7 0-1.3.3-2 .6V7a2 2 0 0 0-2-2Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 15.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Zm6.5-1.5a1 1 0 1 0-2 0v1.5c0 .3.1.5.3.7l1 1a1 1 0 0 0 1.4-1.4l-.7-.7V14Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Toggle confidential mode</span>
            </a>
            <div id="tooltip-confidential-mode" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Toggle confidential mode
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-signature" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M15.5 3.3a1 1 0 0 0-1.4 0l-2 2h.1l6.5 6.5 2-1.9c.4-.4.4-1 0-1.4l-5.2-5.2ZM7 8.3l3.9-1.5 6.3 6.3-1.5 3.9a1 1 0 0 1-.6.6l-9.5 3.3a1 1 0 0 1-1-.1l6.5-6.5A1 1 0 0 0 9.7 13l-6.5 6.4a1 1 0 0 1-.1-1L6.4 9c.1-.3.3-.5.6-.6Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Insert signature</span>
            </a>
            <div id="tooltip-signature" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Insert signature
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </div>
        </form>
      </div>

    </>
  );
}
