let _callback_index = 1;
const callbacks = {};

export default function (
  method: string,
  payload: Record<string, string | number | string[]>
): Promise<{ result: any; status: string }> {
  const wv = window.ReactNativeWebView;

  return new Promise((resolve, reject) => {
    wv.postMessage(
      JSON.stringify({ action: method, data: payload, _cb: _callback_index })
    );
    const listener = function (event) {
      const { status } = event.detail;
      if (status === "success") {
        return resolve(event.detail);
      }
      return reject(event.detail);
    };
    window.addEventListener(`dapp_${method}`, listener, {
      capture: true,
      once: true,
    });
  });
}
