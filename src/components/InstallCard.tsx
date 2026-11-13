import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { APK_URL, isNativeApp, newerApkBuild, useApkAvailable, useInstall } from '../install';

const DISMISS_KEY = 'chemcsec:install-dismissed';

/** How to install, for whichever device is looking. Shared by the home-screen card and the Install page. */
export function InstallSteps() {
  const install = useInstall();
  const apk = useApkAvailable();
  const [declined, setDeclined] = useState(false);

  if (install.installed) {
    return <p><span className="chip ok">Installed</span> ChemCSEC is on this device and works without data.</p>;
  }
  if (install.platform === 'ios') {
    return (
      <div className="stack tight">
        <p>On iPhone and iPad the app is added from Safari:</p>
        <ol className="steps">
          <li>Open this page in <strong>Safari</strong>.</li>
          <li>Tap the <strong>Share</strong> button (the square with an arrow pointing up).</li>
          <li>Scroll down and tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</li>
        </ol>
      </div>
    );
  }
  return (
    <div className="stack">
      {install.canPrompt ? (
        <div className="row">
          <button
            className="btn primary" type="button"
            onClick={async () => setDeclined(!(await install.prompt()))}
          >
            Install app
          </button>
          <span className="small muted">One tap, about 2 MB, no app store needed</span>
        </div>
      ) : (
        <p className="muted">
          {install.platform === 'android'
            ? 'In Chrome, open the ⋮ menu and choose "Install app" or "Add to Home screen".'
            : 'In Chrome or Edge, use the install icon at the right of the address bar.'}
        </p>
      )}
      {declined && <p className="small muted">No problem. You can install later from Menu, then Install.</p>}
      {apk && (install.platform !== 'desktop' || !install.canPrompt) ? (
        <div className="stack tight">
          <div><a className="btn" href={APK_URL}>Download the Android app (APK)</a></div>
          <p className="small muted">
            For Android phones, and handy for sharing by WhatsApp or Bluetooth. Because it does not come from the Play Store, Android will ask you to allow the install and may show a warning first.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** A dismissible invitation on the home screen; in the APK it becomes an update notice instead. */
export function InstallCard() {
  const install = useInstall();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [newer, setNewer] = useState<number | null>(null);
  useEffect(() => {
    newerApkBuild().then(setNewer);
  }, []);

  if (isNativeApp) {
    return newer ? (
      <section className="sheet flat stack tight">
        <h3>An update is available</h3>
        <p className="muted small">You have build {__BUILD__}; build {newer} adds the latest lessons and fixes. Your progress is kept.</p>
        <div><a className="btn primary" href={APK_URL}>Download the update</a></div>
      </section>
    ) : null;
  }
  if (install.installed || dismissed) return null;

  return (
    <section className="sheet stack">
      <div className="between">
        <h2>Put ChemCSEC on your phone</h2>
        <button
          className="btn quiet" type="button"
          onClick={() => {
            setDismissed(true);
            try {
              localStorage.setItem(DISMISS_KEY, '1');
            } catch {
              // not remembered; the card simply shows again next time
            }
          }}
        >
          Not now
        </button>
      </div>
      <p className="muted">Installed, it opens from your home screen like any app and works with no data.</p>
      <InstallSteps />
      <p className="small muted">You can always find this under <Link to="/install">Menu, then Install</Link>.</p>
    </section>
  );
}
