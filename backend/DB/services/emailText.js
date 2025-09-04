// utils/htmlEscape.js (optional but recommended)
const escapeHtml = (s='') =>
  s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

/** Replace {{tokens}} in a template with provided values */
const fill = (tpl, data) =>
  tpl.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    const v = data[key];
    return v == null ? '' : escapeHtml(String(v));
  });

export const credentialEmail = (data) => {
  const template = `
<!doctype html>
<html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Your Access Credentials</title>
    <style>.preheader{display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;}</style>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;">
    <div class="preheader">Your login email and password are inside.</div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f7fb;">
      <tr><td align="center" style="padding:24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e8ef;">
          <tr>
            <td align="center" style="padding:24px 24px 8px 24px;">
              <div style="font:700 18px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;">
                {{brand_name}}
              </div>
              <div style="margin-top:6px;font:500 14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#6b7280;">
                Your access credentials
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 24px 0 24px;">
              <p style="margin:0 0 12px 0;font:400 14px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;">
                Hi {{recipient_name}},<br>
                Your account has been created. Use the credentials below to sign in. For security, please change your password after logging in the settings of your application .
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:12px;background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;">
                <tr>
                  <td style="padding:16px 16px 8px 16px;">
                    <div style="font:600 12px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;">
                      Email
                    </div>
                    <div style="margin-top:6px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px;font:500 14px/1.2 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;color:#111827;-webkit-user-select:all;user-select:all;">
                      {{email}}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 16px 16px 16px;">
                    <div style="font:600 12px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;">
                      Login Password
                    </div>
                    <div style="margin-top:6px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px;font:600 14px/1.2 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;color:#111827;-webkit-user-select:all;user-select:all;">
                      {{password}}
                    </div>
                    <div style="margin-top:6px;font:400 12px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#6b7280;">
                      Tip: tap and hold (mobile) or double-click (desktop) to select & copy.
                    </div>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 8px 0;">
                <tr>
                  <td align="left">
                    <a href="{{app_url}}" target="_blank" style="background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;padding:10px 16px;font:600 14px/1 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;display:inline-block;">
                      Sign in
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:8px 0 0 0;font:400 12px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#6b7280;">
                If you didn't expect this email, you can ignore it or contact support.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 24px 24px 24px;">
              <div style="height:1px;background:#e5e7eb;"></div>
              <p style="margin:12px 0 0 0;font:400 12px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#6b7280;">
                © {{year}} {{brand_name}} • This is an automated message, please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
  `;
  // defaults
  const todayYear = String(new Date().getFullYear());
  const filled = fill(template, {
    brand_name: data.brand_name ?? 'Your Company',
    recipient_name: data.recipient_name ?? 'there',
    email: data.email ?? '',
    password: data.password ?? '',
    app_url: data.app_url ?? '#',
    year: data.year ?? todayYear,
  });
  return filled;
};
