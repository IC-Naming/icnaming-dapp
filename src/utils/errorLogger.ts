// We need this because currently the error details get lost upon reaching the dart code.
export const executeWithLogging = async <T>(
  func: () => Promise<T>,
  name?:string
): Promise<T> => {
  try {
    return await func();
  } catch (e) {
    console.error(`error in ${name},${JSON.stringify(e)}` ,e );
    throw e;
  }
};
