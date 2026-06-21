import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useInitFlowbite } from "@/lib/flowbite";
import { useLocalCrud } from "@/lib/useLocalCrud";
import { Logo } from "@/components/Logo";
import type { MeetingRating } from "./meetings.types";

/**
 * Flowbite "rate-conversation.html" sayfasından çevrildi. Markup korunur.
 * Backend ucu YOK → puanlama localStorage'da (useLocalCrud "meeting_ratings")
 * saklanır. Yıldızlar tıklanabilir, geri bildirim metni + yıldız kaydedilir.
 */
export function RateConversationPage() {
  useInitFlowbite();
  const { t } = useTranslation("meetings");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const meetingId = params.get("meetingId") ?? undefined;

  const ratings = useLocalCrud<MeetingRating>("meeting_ratings");
  const [stars, setStars] = useState(3);
  const [feedback, setFeedback] = useState("");
  const [saved, setSaved] = useState(false);

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    ratings.create(
      {
        meeting_id: meetingId,
        stars,
        feedback: feedback.trim(),
        created_at: new Date().toISOString(),
      },
      { prepend: true },
    );
    setSaved(true);
  };

  const resetFeedback = () => {
    setSaved(false);
    setStars(3);
    setFeedback("");
  };

  return (
    <>

      <section>
        <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-xl items-center justify-center px-4 xl:px-0">
          <div>
            <div className="mb-6">
              <Logo className="h-8" />
            </div>
            <h1 className="mb-4 text-xl font-semibold leading-tight text-ink dark:text-white">{t("rate.title")}</h1>
            <p className="mb-4 text-sm text-muted dark:text-gray-400 md:mb-6">{t("rate.subtitle")}</p>
            <div className="mb-4 w-full items-center space-y-4 border-b border-gray-200 pb-4 dark:border-gray-800 sm:flex sm:space-x-4 sm:space-y-0 md:mb-6 md:pb-6">
              <button type="button" onClick={() => navigate("/lobby")} className="w-full shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto">
                {t("rate.rejoin")}
              </button>
              <button type="button" onClick={() => navigate("/meetings")} className="inline-flex w-full shrink-0 items-center justify-center rounded-lg border border-primary-700 bg-primary-700 px-3 py-2.5 text-center text-sm font-medium text-white hover:border-primary-800 hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:border-primary-600 dark:bg-primary-600 dark:hover:border-primary-700 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:w-auto">
                {t("rate.returnHome")}
              </button>
              <button type="button" data-drawer-target="feedback-drawer" data-drawer-show="feedback-drawer" data-drawer-placement="right" aria-controls="feedback-drawer" aria-expanded="false" className="flex justify-center text-sm font-medium text-primary-700 hover:underline dark:text-primary-500 sm:justify-start">
                {t("rate.submitFeedback")}
              </button>
            </div>
            <div className="flex items-center pr-5 text-sm text-gray-500 dark:text-gray-400">
              <svg className="me-1 hidden h-4 w-4 sm:flex" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.356 3.066a1 1 0 0 0-.712 0l-7 2.666A1 1 0 0 0 4 6.68a17.695 17.695 0 0 0 2.022 7.98 17.405 17.405 0 0 0 5.403 6.158 1 1 0 0 0 1.15 0 17.406 17.406 0 0 0 5.402-6.157A17.694 17.694 0 0 0 20 6.68a1 1 0 0 0-.644-.949l-7-2.666Z" />
              </svg>
              {t("rate.safeNote")}
            </div>
          </div>
        </div>
      </section>

      {/* submit feedback drawer */}
      <div id="feedback-drawer" className="fixed right-0 top-0 z-40 h-[100dvh] w-full max-w-md translate-x-full overflow-y-auto bg-white p-4 antialiased transition-transform duration-[var(--dur-modal)] ease-[var(--ease-drawer)] dark:bg-gray-800" tabIndex={-1} aria-labelledby="feedback-drawer-label" aria-hidden="true">
        <h5 id="feedback-drawer-label" className="mb-6 inline-flex items-center text-sm font-semibold text-ink dark:text-white">{t("feedback.submitFeedback")}</h5>
        <button type="button" data-drawer-dismiss="feedback-drawer" aria-controls="feedback-drawer" className="absolute right-2.5 top-2.5 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
          <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
          <span className="sr-only">{t("feedback.closeMenu")}</span>
        </button>
        <form action="#" onSubmit={submitFeedback}>
          {saved ? (
            <div className="space-y-4 motion-safe:tl-stagger">
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-gray-700 dark:text-green-400">
                <svg className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">{t("feedback.sent")}</p>
                  <p>{t("feedback.thanks")}</p>
                </div>
              </div>
              <div className="flex w-full justify-center space-x-3 pb-4">
                <button type="button" onClick={resetFeedback} className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                  {t("feedback.newFeedback")}
                </button>
                <button type="button" data-drawer-dismiss="feedback-drawer" aria-controls="feedback-drawer" onClick={resetFeedback} className="w-full justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                  {t("feedback.close")}
                </button>
              </div>
            </div>
          ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStars(n)}
                  aria-label={`${n} ${t("feedback.happy")}`}
                  className={(n === 1 ? "" : "ms-2 ") + "transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97]"}
                >
                  <svg
                    className={
                      "h-6 w-6 cursor-pointer " +
                      (n <= stars ? "text-yellow-300" : "text-gray-300 dark:text-gray-500")
                    }
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 20"
                  >
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                  </svg>
                </button>
              ))}
              <span className="ms-2 text-sm font-semibold text-ink dark:text-white">{stars}/5</span>
            </div>
            <div>
              <label htmlFor="feedback" className="label">{t("feedback.yourFeedback")} <span className="dark:text-gray-400 font-normal text-muted">{t("feedback.feedbackChars")}</span></label>
              <textarea id="feedback" rows={5} value={feedback} onChange={(e) => { setFeedback(e.target.value); setSaved(false); }} className="input mb-2" required></textarea>
              <p className="ms-auto text-xs text-gray-500 dark:text-gray-400">{t("feedback.feedbackHint")}</p>
            </div>
            <div>
              <label htmlFor="dropzone-file" className="mb-2 block text-sm font-medium text-ink dark:text-white">{t("feedback.addPhotos")} <span className="text-muted dark:text-gray-400">{t("feedback.optional")}</span></label>
              <div className="flex w-full items-center justify-center">
                <label htmlFor="dropzone-file" className="dark:hover:bg-gray-800 flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors ease-[var(--ease-out)] hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <svg className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">{t("feedback.clickToUpload")}</span>{t("feedback.dragAndDrop")}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("feedback.maxFile")}</p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex w-full justify-center space-x-3 pb-4">
              <button type="submit" className="w-full justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                {t("feedback.submit")}
              </button>
              <button type="button" data-drawer-dismiss="feedback-drawer" aria-controls="feedback-drawer" className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                {t("feedback.cancel")}
              </button>
            </div>
          </div>
          )}
        </form>
      </div>

    </>
  );
}
