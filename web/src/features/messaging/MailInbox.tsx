import { useInitFlowbite } from "@/lib/flowbite";
import inboxMessages from "./inbox.data.json";

/**
 * Flowbite "inbox.html" sayfasından birebir çevrildi.
 * tools/flowbite-to-jsx.mjs ile üretildi; markup elle değiştirilmez.
 * Satırlar kaynaktaki Hugo `range Site.Data.messages` döngüsüne karşılık
 * inbox.data.json üzerinden üretilir (read durumuna göre koşullu sınıflar).
 */
export function MailInbox() {
  useInitFlowbite();
  return (
    <>

      <div className="flex items-center justify-between border-b border-line bg-surface p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center">
          <div className="pe-4">
            <input id="checkbox-all" aria-describedby="checkbox-1" type="checkbox" className="focus:ring-3 h-4 w-4 rounded-sm border-gray-300 bg-gray-50 focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600" />
            <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
          </div>
          <div className="h-5 w-px bg-gray-100 dark:bg-gray-700"></div>
          <div className="flex space-x-1 px-2">
            <a href="#" data-tooltip-target="tooltip-archive" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4 4a2 2 0 1 0 0 4h16a2 2 0 1 0 0-4H4Zm0 6h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Zm10.7 5.7a1 1 0 0 0-1.4-1.4l-.3.3V12a1 1 0 1 0-2 0v2.6l-.3-.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l2-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Archive</span>
            </a>
            <div id="tooltip-archive" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Archive
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-spam" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Report Spam</span>
            </a>
            <div id="tooltip-spam" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Report Spam
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-delete" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
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
          <div className="flex space-x-1 sm:px-2">
            <a href="#" data-tooltip-target="tooltip-unread" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
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
            <a href="#" data-tooltip-target="tooltip-snooze" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v4c0 .3.1.5.3.7l3 3a1 1 0 0 0 1.4-1.4L13 11.6V8Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Snooze</span>
            </a>
            <div id="tooltip-snooze" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Snooze
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-add-to-tasks" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
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
            <a href="#" data-tooltip-target="tooltip-move" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M5 4a2 2 0 0 0-2 2v1h11l-2-2.3a2 2 0 0 0-1.5-.7H5ZM3 19V9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm11.7-7.7a1 1 0 0 0-1.4 1.4l.3.3H8a1 1 0 1 0 0 2h5.6l-.3.3a1 1 0 0 0 1.4 1.4l2-2c.4-.4.4-1 0-1.4l-2-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Move to</span>
            </a>
            <div id="tooltip-move" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Move to
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" data-tooltip-target="tooltip-labels" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white md:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M3 4a1 1 0 0 0-.822 1.57L6.632 12l-4.454 6.43A1 1 0 0 0 3 20h13.153a1 1 0 0 0 .822-.43l4.847-7a1 1 0 0 0 0-1.14l-4.847-7a1 1 0 0 0-.822-.43H3Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Labels</span>
            </a>
            <div id="tooltip-labels" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Labels
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <button id="mail-dropdown-button" type="button" data-dropdown-toggle="mail-dropdown" className="inline-flex items-center rounded-lg p-2 text-center text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="4" d="M12 6h0m0 6h0m0 6h0" />
              </svg>
            </button>
            <div id="mail-dropdown" className="z-10 hidden w-60 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-sm motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:divide-gray-600 dark:bg-gray-700">
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
                    <svg className="me-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" d="M11.083 4.104c.35-.8 1.485-.8 1.834 0l1.752 4.022a1 1 0 0 0 .84.597l4.463.342c.9.069 1.255 1.2.557 1.771l-3.33 2.723a1 1 0 0 0-.337 1.016l1.029 4.119c.214.858-.71 1.552-1.474 1.106l-3.913-2.281a1 1 0 0 0-1.008 0L7.583 19.8c-.764.446-1.688-.248-1.473-1.106l1.029-4.119a1 1 0 0 0-.337-1.016l-3.33-2.723c-.699-.571-.343-1.702.556-1.771l4.463-.342a1 1 0 0 0 .84-.597l1.752-4.022Z" />
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
            <button type="button" id="composeButton" data-modal-target="composeModal" data-modal-toggle="composeModal" className="flex w-full items-center justify-center rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-[transform,background-color] hover:bg-primary-800 motion-safe:active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:w-auto">
              <svg className="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5"></path>
              </svg>
              Compose
            </button>
          </div>
        </div>
        <div className="hidden items-center space-x-1 sm:flex sm:space-y-0">
          <span className="me-4 hidden text-sm text-gray-500 dark:text-gray-400 md:flex">Show <span className="mx-1  font-semibold text-gray-900 dark:text-white">1-25</span> of <span className="ms-1 font-semibold text-gray-900 dark:text-white">2290</span></span>
          <button type="button" data-tooltip-target="tooltip-prev-page" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7" />
            </svg>
            <span className="sr-only">Prev page</span>
          </button>
          <div id="tooltip-prev-page" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            Prev page
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button type="button" data-tooltip-target="tooltip-next-page" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7" />
            </svg>
            <span className="sr-only">Next page</span>
          </button>
          <div id="tooltip-next-page" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            Next page
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow-sm">
              <table className="min-w-full table-fixed divide-y divide-line">
                <tbody className="divide-y divide-line bg-surface dark:divide-gray-700 dark:bg-gray-800">
                  {inboxMessages.map((m) => (
                    <tr key={m.id} className="tl-stagger cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 motion-safe:active:scale-[0.99]">
                      <td className="w-4 p-4">
                        <div className="inline-flex items-center space-x-4">
                          <div>
                            <input id={`checkbox-${m.id}`} aria-describedby={`checkbox-${m.id}`} type="checkbox" className="focus:ring-3 h-4 w-4 rounded-sm border-gray-300 bg-gray-50 focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600" />
                            <label htmlFor={`checkbox-${m.id}`} className="sr-only">checkbox</label>
                          </div>
                          <svg data-tooltip-target={`tooltip-starred-${m.id}`} className="h-5 w-5 cursor-pointer text-gray-500 transition-colors hover:text-yellow-400 motion-safe:active:scale-[0.92] dark:text-gray-400 dark:hover:text-yellow-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeWidth="2" d="M11.083 4.104c.35-.8 1.485-.8 1.834 0l1.752 4.022a1 1 0 0 0 .84.597l4.463.342c.9.069 1.255 1.2.557 1.771l-3.33 2.723a1 1 0 0 0-.337 1.016l1.029 4.119c.214.858-.71 1.552-1.474 1.106l-3.913-2.281a1 1 0 0 0-1.008 0L7.583 19.8c-.764.446-1.688-.248-1.473-1.106l1.029-4.119a1 1 0 0 0-.337-1.016l-3.33-2.723c-.699-.571-.343-1.702.556-1.771l4.463-.342a1 1 0 0 0 .84-.597l1.752-4.022Z" />
                          </svg>
                          <div id={`tooltip-starred-${m.id}`} role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Not starred
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <svg className="h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16.2 19 4.8-7-4.8-7H3l4.8 7L3 19h13.2Z" />
                          </svg>
                        </div>
                      </td>
                      <td className="flex items-center space-x-4 whitespace-nowrap p-4">
                        <div className={`${m.read ? "font-normal text-gray-700 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-white"} text-sm`}>{m.name}</div>
                      </td>
                      <td className={`${m.read ? " font-normal text-gray-500 dark:text-gray-400 " : " font-semibold text-gray-900 dark:text-white "} max-w-sm overflow-hidden truncate p-4 text-sm xl:max-w-screen-md 2xl:max-w-screen-lg`}>
                        {m.text}
                      </td>
                      <td className={`${m.read ? "font-normal text-muted dark:text-gray-400" : "font-medium text-gray-900 dark:text-white"} whitespace-nowrap p-4 text-sm`}>{m.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line bg-surface p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col justify-between lg:flex-row lg:items-center xl:mb-0">
          <div className="order-1 mb-4 w-full sm:w-96 lg:mb-0">
            <div className="mb-1 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-1.5 rounded-full bg-primary-600 dark:bg-primary-500" style={{ width: "45%" }}></div>
            </div>
            <div className="text-xs font-medium text-gray-500 dark:text-white">7.2 GB of 15 GB used</div>
          </div>
          <p className="order-3 text-sm text-gray-500 dark:text-gray-400 lg:order-2 xl:flex">Copyright &copy; 2025 <a href="https://flowbite.com/" className="ml-1 hover:underline" target="_blank">Flowbite</a>. All rights reserved.</p>
          <div className="order-2 mb-4 text-sm text-gray-500 dark:text-gray-400 lg:order-3 lg:mb-0 lg:text-right">
            <p>Last account activity: 12 hours ago</p>
            <a href="#" className="font-medium text-gray-900 underline hover:no-underline dark:text-white">Details</a>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      <div id="composeModal" tabIndex={-1} aria-hidden="true" className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0">
        <div className="relative max-h-full w-full max-w-3xl p-4">
          {/* Modal content */}
          <div className="relative rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-5 motion-safe:[animation:tl-modal-in_var(--dur-modal)_var(--ease-out)]">
            {/* Modal header */}
            <div className="mb-4 flex items-center justify-between dark:border-gray-600 sm:mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Compose an email</h3>
              <button type="button" className="inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="composeModal">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                </svg>

                <span className="sr-only">Close modal</span>
              </button>
            </div>
            {/* Modal body */}
            <form action="#">
              <div className="mb-4 space-y-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">To</label>
                  <input type="email" name="name" id="name" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Add recipients" required />
                </div>
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Subject</label>
                  <input type="text" name="subject" id="subject" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder="Type your subject here" required />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Message</label>
                  <div className="w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                    <div className="border-b px-3 py-2 dark:border-gray-600 border-gray-200">
                      <div className="flex flex-wrap items-center">
                        <div className="flex flex-wrap items-center space-x-1 rtl:space-x-reverse">
                          <button id="toggleBoldButton" data-tooltip-target="tooltip-bold" type="button" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5h4.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0-7H6m2 7h6.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0 0H6" />
                            </svg>
                            <span className="sr-only">Bold</span>
                          </button>
                          <div id="tooltip-bold" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Toggle bold
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <button id="toggleItalicButton" data-tooltip-target="tooltip-italic" type="button" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.874 19 6.143-14M6 19h6.33m-.66-14H18" />
                            </svg>
                            <span className="sr-only">Italic</span>
                          </button>
                          <div id="tooltip-italic" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Toggle italic
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <button id="toggleUnderlineButton" data-tooltip-target="tooltip-underline" type="button" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M6 19h12M8 5v9a4 4 0 0 0 8 0V5M6 5h4m4 0h4" />
                            </svg>
                            <span className="sr-only">Underline</span>
                          </button>
                          <div id="tooltip-underline" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Toggle underline
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <button id="toggleStrikeButton" data-tooltip-target="tooltip-strike" type="button" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 6.2V5h12v1.2M7 19h6m.2-14-1.677 6.523M9.6 19l1.029-4M5 5l6.523 6.523M19 19l-7.477-7.477" />
                            </svg>
                            <span className="sr-only">Strike</span>
                          </button>
                          <div id="tooltip-strike" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Toggle strike
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <button id="toggleHighlightButton" data-tooltip-target="tooltip-highlight" type="button" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M9 19.2H5.5c-.3 0-.5-.2-.5-.5V16c0-.2.2-.4.5-.4h13c.3 0 .5.2.5.4v2.7c0 .3-.2.5-.5.5H18m-6-1 1.4 1.8h.2l1.4-1.7m-7-5.4L12 4c0-.1 0-.1 0 0l4 8.8m-6-2.7h4m-7 2.7h2.5m5 0H17" />
                            </svg>
                            <span className="sr-only">Highlight</span>
                          </button>
                          <div id="tooltip-highlight" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Toggle highlight
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <button id="toggleCodeButton" type="button" data-tooltip-target="tooltip-code" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14" />
                            </svg>
                            <span className="sr-only">Code</span>
                          </button>
                          <div id="tooltip-code" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Format code
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <button id="toggleLinkButton" data-tooltip-target="tooltip-link" type="button" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961" />
                            </svg>
                            <span className="sr-only">Link</span>
                          </button>
                          <div id="tooltip-link" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Add link
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <button id="removeLinkButton" data-tooltip-target="tooltip-remove-link" type="button" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M13.2 9.8a3.4 3.4 0 0 0-4.8 0L5 13.2A3.4 3.4 0 0 0 9.8 18l.3-.3m-.3-4.5a3.4 3.4 0 0 0 4.8 0L18 9.8A3.4 3.4 0 0 0 13.2 5l-1 1m7.4 14-1.8-1.8m0 0L16 16.4m1.8 1.8 1.8-1.8m-1.8 1.8L16 20" />
                            </svg>
                            <span className="sr-only">Remove link</span>
                          </button>
                          <div id="tooltip-remove-link" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Remove link
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <button id="toggleTextSizeButton" data-dropdown-toggle="textSizeDropdown" type="button" data-tooltip-target="tooltip-text-size" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3" />
                            </svg>
                            <span className="sr-only">Text size</span>
                          </button>
                          <div id="tooltip-text-size" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Text size
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <div id="textSizeDropdown" className="z-10 hidden w-72 origin-top-left rounded-sm bg-white p-2 shadow-sm motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:bg-gray-700">
                            <ul className="space-y-1 text-sm font-medium" aria-labelledby="toggleTextSizeButton">
                              <li>
                                <button data-text-size="16px" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-base text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">
                                  16px (Default)
                                </button>
                              </li>
                              <li>
                                <button data-text-size="12px" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-xs text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">12px (Tiny)</button>
                              </li>
                              <li>
                                <button data-text-size="14px" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">14px (Small)</button>
                              </li>
                              <li>
                                <button data-text-size="18px" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-lg text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">18px (Lead)</button>
                              </li>
                              <li>
                                <button data-text-size="24px" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-2xl text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">24px (Large)</button>
                              </li>
                              <li>
                                <button data-text-size="36px" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-4xl text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">36px (Huge)</button>
                              </li>
                            </ul>
                          </div>
                          <button id="toggleTextColorButton" data-dropdown-toggle="textColorDropdown" type="button" data-tooltip-target="tooltip-text-color" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="25" height="24" fill="none" viewBox="0 0 25 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m6.532 15.982 1.573-4m-1.573 4h-1.1m1.1 0h1.65m-.077-4 2.725-6.93a.11.11 0 0 1 .204 0l2.725 6.93m-5.654 0H8.1m.006 0h5.654m0 0 .617 1.569m5.11 4.453c0 1.102-.854 1.996-1.908 1.996-1.053 0-1.907-.894-1.907-1.996 0-1.103 1.907-4.128 1.907-4.128s1.909 3.025 1.909 4.128Z" />
                            </svg>
                            <span className="sr-only">Text color</span>
                          </button>
                          <div id="tooltip-text-color" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Text color
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <div id="textColorDropdown" className="z-10 hidden w-48 origin-top-left rounded-sm bg-white p-2 shadow-sm motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:bg-gray-700">
                            <div className="group mb-3 grid grid-cols-6 items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600">
                              <input type="color" id="color" value="#e66465" className="col-span-3 h-8 w-full rounded-md border border-gray-200 bg-gray-50 p-px px-1 hover:bg-gray-50 group-hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:group-hover:bg-gray-700" />
                              <label htmlFor="color" className="col-span-3 text-sm font-medium text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white">Pick a color</label>
                            </div>
                            <div className="mb-3 grid grid-cols-6 gap-1">
                              <button type="button" data-hex-color="#1A56DB" style={{ backgroundColor: "#1A56DB" }} className="h-6 w-6 rounded-md"><span className="sr-only">Blue</span></button>
                              <button type="button" data-hex-color="#0E9F6E" style={{ backgroundColor: "#0E9F6E" }} className="h-6 w-6 rounded-md"><span className="sr-only">Green</span></button>
                              <button type="button" data-hex-color="#FACA15" style={{ backgroundColor: "#FACA15" }} className="h-6 w-6 rounded-md"><span className="sr-only">Yellow</span></button>
                              <button type="button" data-hex-color="#F05252" style={{ backgroundColor: "#F05252" }} className="h-6 w-6 rounded-md"><span className="sr-only">Red</span></button>
                              <button type="button" data-hex-color="#FF8A4C" style={{ backgroundColor: "#FF8A4C" }} className="h-6 w-6 rounded-md"><span className="sr-only">Orange</span></button>
                              <button type="button" data-hex-color="#0694A2" style={{ backgroundColor: "#0694A2" }} className="h-6 w-6 rounded-md"><span className="sr-only">Teal</span></button>
                              <button type="button" data-hex-color="#B4C6FC" style={{ backgroundColor: "#B4C6FC" }} className="h-6 w-6 rounded-md"><span className="sr-only">Light indigo</span></button>
                              <button type="button" data-hex-color="#8DA2FB" style={{ backgroundColor: "#8DA2FB" }} className="h-6 w-6 rounded-md"><span className="sr-only">Indigo</span></button>
                              <button type="button" data-hex-color="#5145CD" style={{ backgroundColor: "#5145CD" }} className="h-6 w-6 rounded-md"><span className="sr-only">Purple</span></button>
                              <button type="button" data-hex-color="#771D1D" style={{ backgroundColor: "#771D1D" }} className="h-6 w-6 rounded-md"><span className="sr-only">Brown</span></button>
                              <button type="button" data-hex-color="#FCD9BD" style={{ backgroundColor: "#FCD9BD" }} className="h-6 w-6 rounded-md"><span className="sr-only">Light orange</span></button>
                              <button type="button" data-hex-color="#99154B" style={{ backgroundColor: "#99154B" }} className="h-6 w-6 rounded-md"><span className="sr-only">Bordo</span></button>
                              <button type="button" data-hex-color="#7E3AF2" style={{ backgroundColor: "#7E3AF2" }} className="h-6 w-6 rounded-md"><span className="sr-only">Dark Purple</span></button>
                              <button type="button" data-hex-color="#CABFFD" style={{ backgroundColor: "#CABFFD" }} className="h-6 w-6 rounded-md"><span className="sr-only">Light</span></button>
                              <button type="button" data-hex-color="#D61F69" style={{ backgroundColor: "#D61F69" }} className="h-6 w-6 rounded-md"><span className="sr-only">Dark Pink</span></button>
                              <button type="button" data-hex-color="#F8B4D9" style={{ backgroundColor: "#F8B4D9" }} className="h-6 w-6 rounded-md"><span className="sr-only">Pink</span></button>
                              <button type="button" data-hex-color="#F6C196" style={{ backgroundColor: "#F6C196" }} className="h-6 w-6 rounded-md"><span className="sr-only">Cream</span></button>
                              <button type="button" data-hex-color="#A4CAFE" style={{ backgroundColor: "#A4CAFE" }} className="h-6 w-6 rounded-md"><span className="sr-only">Light Blue</span></button>
                              <button type="button" data-hex-color="#5145CD" style={{ backgroundColor: "#5145CD" }} className="h-6 w-6 rounded-md"><span className="sr-only">Dark Blue</span></button>
                              <button type="button" data-hex-color="#B43403" style={{ backgroundColor: "#B43403" }} className="h-6 w-6 rounded-md"><span className="sr-only">Orange Brown</span></button>
                              <button type="button" data-hex-color="#FCE96A" style={{ backgroundColor: "#FCE96A" }} className="h-6 w-6 rounded-md"><span className="sr-only">Light Yellow</span></button>
                              <button type="button" data-hex-color="#1E429F" style={{ backgroundColor: "#1E429F" }} className="h-6 w-6 rounded-md"><span className="sr-only">Navy Blue</span></button>
                              <button type="button" data-hex-color="#768FFD" style={{ backgroundColor: "#768FFD" }} className="h-6 w-6 rounded-md"><span className="sr-only">Light Purple</span></button>
                              <button type="button" data-hex-color="#BCF0DA" style={{ backgroundColor: "#BCF0DA" }} className="h-6 w-6 rounded-md"><span className="sr-only">Light Green</span></button>
                              <button type="button" data-hex-color="#EBF5FF" style={{ backgroundColor: "#EBF5FF" }} className="h-6 w-6 rounded-md"><span className="sr-only">Sky Blue</span></button>
                              <button type="button" data-hex-color="#16BDCA" style={{ backgroundColor: "#16BDCA" }} className="h-6 w-6 rounded-md"><span className="sr-only">Cyan</span></button>
                              <button type="button" data-hex-color="#E74694" style={{ backgroundColor: "#E74694" }} className="h-6 w-6 rounded-md"><span className="sr-only">Pink</span></button>
                              <button type="button" data-hex-color="#83B0ED" style={{ backgroundColor: "#83B0ED" }} className="h-6 w-6 rounded-md"><span className="sr-only">Darker Sky Blue</span></button>
                              <button type="button" data-hex-color="#03543F" style={{ backgroundColor: "#03543F" }} className="h-6 w-6 rounded-md"><span className="sr-only">Forest Green</span></button>
                              <button type="button" data-hex-color="#111928" style={{ backgroundColor: "#111928" }} className="h-6 w-6 rounded-md"><span className="sr-only">Black</span></button>
                              <button type="button" data-hex-color="#4B5563" style={{ backgroundColor: "#4B5563" }} className="h-6 w-6 rounded-md"><span className="sr-only">Stone</span></button>
                              <button type="button" data-hex-color="#6B7280" style={{ backgroundColor: "#6B7280" }} className="h-6 w-6 rounded-md"><span className="sr-only">Gray</span></button>
                              <button type="button" data-hex-color="#D1D5DB" style={{ backgroundColor: "#D1D5DB" }} className="h-6 w-6 rounded-md"><span className="sr-only">Light Gray</span></button>
                              <button type="button" data-hex-color="#F3F4F6" style={{ backgroundColor: "#F3F4F6" }} className="h-6 w-6 rounded-md"><span className="sr-only">Cloud Gray</span></button>
                              <button type="button" data-hex-color="#F3F4F6" style={{ backgroundColor: "#F3F4F6" }} className="h-6 w-6 rounded-md"><span className="sr-only">Cloud Gray</span></button>
                              <button type="button" data-hex-color="#F9FAFB" style={{ backgroundColor: "#F9FAFB" }} className="h-6 w-6 rounded-md"><span className="sr-only">Heaven Gray</span></button>
                            </div>
                            <button type="button" id="reset-color" className="w-full rounded-lg bg-white py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-700">
                              Reset color
                            </button>
                          </div>
                          <button id="toggleFontFamilyButton" data-dropdown-toggle="fontFamilyDropdown" type="button" data-tooltip-target="tooltip-font-family" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10.6 19 4.298-10.93a.11.11 0 0 1 .204 0L19.4 19m-8.8 0H9.5m1.1 0h1.65m7.15 0h-1.65m1.65 0h1.1m-7.7-3.985h4.4M3.021 16l1.567-3.985m0 0L7.32 5.07a.11.11 0 0 1 .205 0l2.503 6.945h-5.44Z" />
                            </svg>
                            <span className="sr-only">Font family</span>
                          </button>
                          <div id="tooltip-font-family" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Font Family
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <div id="fontFamilyDropdown" className="z-10 hidden w-48 origin-top-left rounded-sm bg-white p-2 shadow-sm motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:bg-gray-700">
                            <ul className="space-y-1 text-sm font-medium" aria-labelledby="toggleFontFamilyButton">
                              <li>
                                <button data-font-family="Inter, ui-sans-serif" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 font-sans text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">
                                  Default
                                </button>
                              </li>
                              <li>
                                <button data-font-family="Arial, sans-serif" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
                                  Arial
                                </button>
                              </li>
                              <li>
                                <button data-font-family="'Courier New', monospace" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600" style={{ fontFamily: "'Courier New', monospace" }}>
                                  Courier New
                                </button>
                              </li>
                              <li>
                                <button data-font-family="Georgia, serif" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600" style={{ fontFamily: "Georgia, serif" }}>
                                  Georgia
                                </button>
                              </li>
                              <li>
                                <button data-font-family="'Lucida Sans Unicode', sans-serif" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600" style={{ fontFamily: "'Lucida Sans Unicode', sans-serif" }}>
                                  Lucida Sans Unicode
                                </button>
                              </li>
                              <li>
                                <button data-font-family="Tahoma, sans-serif" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600" style={{ fontFamily: "Tahoma, sans-serif" }}>
                                  Tahoma
                                </button>
                              </li>
                              <li>
                                <button data-font-family="'Times New Roman', serif;" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600" style={{ fontFamily: "'Times New Roman', serif" }}>
                                  Times New Roman
                                </button>
                              </li>
                              <li>
                                <button data-font-family="'Trebuchet MS', sans-serif" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                                  Trebuchet MS
                                </button>
                              </li>
                              <li>
                                <button data-font-family="Verdana, sans-serif" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600" style={{ fontFamily: "Verdana, sans-serif" }}>
                                  Verdana
                                </button>
                              </li>
                            </ul>
                          </div>
                          <div className="px-1">
                            <span className="block h-4 w-px bg-gray-300 dark:bg-gray-600"></span>
                          </div>
                          <button id="toggleLeftAlignButton" type="button" data-tooltip-target="tooltip-left-align" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6h8m-8 4h12M6 14h8m-8 4h12" />
                            </svg>
                            <span className="sr-only">Align left</span>
                          </button>
                          <div id="tooltip-left-align" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Align left
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <button id="toggleCenterAlignButton" type="button" data-tooltip-target="tooltip-center-align" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h8M6 10h12M8 14h8M6 18h12" />
                            </svg>
                            <span className="sr-only">Align center</span>
                          </button>
                          <div id="tooltip-center-align" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Align center
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <button id="toggleRightAlignButton" type="button" data-tooltip-target="tooltip-right-align" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6h-8m8 4H6m12 4h-8m8 4H6" />
                            </svg>
                            <span className="sr-only">Align right</span>
                          </button>
                          <div id="tooltip-right-align" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            Align right
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button id="typographyDropdownButton" data-dropdown-toggle="typographyDropdown" className="flex items-center justify-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-50 dark:bg-gray-600 dark:text-gray-400 dark:hover:bg-gray-500 dark:hover:text-white dark:focus:ring-gray-600" type="button">
                          Format
                          <svg className="-me-0.5 ms-1.5 h-3.5 w-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="ps-1.5">
                          <span className="block h-4 w-px bg-gray-300 dark:bg-gray-600"></span>
                        </div>
                        {/* Heading Dropdown */}
                        <div id="typographyDropdown" className="z-10 hidden w-72 origin-top-left rounded-sm bg-white p-2 shadow-sm motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:bg-gray-700">
                          <ul className="space-y-1 text-sm font-medium" aria-labelledby="typographyDropdownButton">
                            <li>
                              <button id="toggleParagraphButton" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-base text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">
                                Paragraph
                                <div className="space-x-1.5">
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Cmd</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Alt</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">0</kbd>
                                </div>
                              </button>
                            </li>
                            <li>
                              <button data-heading-level="1" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-base text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">
                                Heading 1
                                <div className="space-x-1.5">
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Cmd</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Alt</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">1</kbd>
                                </div>
                              </button>
                            </li>
                            <li>
                              <button data-heading-level="2" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-base text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">
                                Heading 2
                                <div className="space-x-1.5">
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Cmd</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Alt</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">2</kbd>
                                </div>
                              </button>
                            </li>
                            <li>
                              <button data-heading-level="3" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-base text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">
                                Heading 3
                                <div className="space-x-1.5">
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Cmd</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Alt</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">3</kbd>
                                </div>
                              </button>
                            </li>
                            <li>
                              <button data-heading-level="4" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-base text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">
                                Heading 4
                                <div className="space-x-1.5">
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Cmd</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Alt</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">4</kbd>
                                </div>
                              </button>
                            </li>
                            <li>
                              <button data-heading-level="5" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-base text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">
                                Heading 5
                                <div className="space-x-1.5">
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Cmd</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Alt</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">5</kbd>
                                </div>
                              </button>
                            </li>
                            <li>
                              <button data-heading-level="6" type="button" className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-base text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600">
                                Heading 6
                                <div className="space-x-1.5">
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Cmd</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">Alt</kbd>
                                  <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">6</kbd>
                                </div>
                              </button>
                            </li>
                          </ul>
                        </div>
                        <button id="addImageButton" type="button" data-tooltip-target="tooltip-image" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M13 10a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12c0 .556-.227 1.06-.593 1.422A.999.999 0 0 1 20.5 20H4a2.002 2.002 0 0 1-2-2V6Zm6.892 12 3.833-5.356-3.99-4.322a1 1 0 0 0-1.549.097L4 12.879V6h16v9.95l-3.257-3.619a1 1 0 0 0-1.557.088L11.2 18H8.892Z" clipRule="evenodd" />
                          </svg>
                          <span className="sr-only">Add image</span>
                        </button>
                        <div id="tooltip-image" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                          Add image
                          <div className="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="addVideoButton" type="button" data-tooltip-target="tooltip-video" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Zm-2 4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H9Zm0 2h2v2H9v-2Zm7.965-.557a1 1 0 0 0-1.692-.72l-1.268 1.218a1 1 0 0 0-.308.721v.733a1 1 0 0 0 .37.776l1.267 1.032a1 1 0 0 0 1.631-.776v-2.984Z" clipRule="evenodd" />
                          </svg>
                          <span className="sr-only">Add video</span>
                        </button>
                        <div id="tooltip-video" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                          Add video
                          <div className="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="toggleListButton" type="button" data-tooltip-target="tooltip-list" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5" />
                          </svg>
                          <span className="sr-only">Toggle list</span>
                        </button>
                        <div id="tooltip-list" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                          Toggle list
                          <div className="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="toggleOrderedListButton" type="button" data-tooltip-target="tooltip-ordered-list" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6h8m-8 6h8m-8 6h8M4 16a2 2 0 1 1 3.321 1.5L4 20h5M4 5l2-1v6m-2 0h4" />
                          </svg>
                          <span className="sr-only">Toggle ordered list</span>
                        </button>
                        <div id="tooltip-ordered-list" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                          Toggle ordered list
                          <div className="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="toggleBlockquoteButton" type="button" data-tooltip-target="tooltip-blockquote-list" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M6 6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3H5a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2H6Zm9 0a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3h-1a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3Z" clipRule="evenodd" />
                          </svg>
                          <span className="sr-only">Toggle blockquote</span>
                        </button>
                        <div id="tooltip-blockquote-list" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                          Toggle blockquote
                          <div className="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="toggleHRButton" type="button" data-tooltip-target="tooltip-hr-list" className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 12h14" />
                            <path stroke="currentColor" strokeLinecap="round" d="M6 9.5h12m-12 9h12M6 7.5h12m-12 9h12M6 5.5h12m-12 9h12" />
                          </svg>
                          <span className="sr-only">Toggle Horizontal Rule</span>
                        </button>
                        <div id="tooltip-hr-list" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                          Toggle Horizontal Rule
                          <div className="tooltip-arrow" data-popper-arrow></div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-b-lg bg-white px-4 py-2 dark:bg-gray-800">
                      <label htmlFor="wysiwyg-example" className="sr-only">Publish post</label>
                      <div id="wysiwyg-example" className="block w-full border-0 bg-white px-0 text-sm text-gray-800 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-center text-sm font-medium text-white transition-[transform,background-color] hover:bg-primary-800 motion-safe:active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                  Send message
                  <span className="sr-only">Add event</span>
                </button>
                <button data-modal-toggle="composeModal" type="button" className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition-[transform,background-color] hover:bg-gray-100 hover:text-primary-700 motion-safe:active:scale-[0.97] focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </>
  );
}
