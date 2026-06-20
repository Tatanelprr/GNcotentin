import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm'

emailjs.init('-7WfZ8RCbLlNvAZbE')

document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault()

  const label   = document.getElementById('submit-label')
  const spinner = document.getElementById('submit-spinner')
  const btn     = document.getElementById('contact-submit')
  const success = document.getElementById('contact-success')
  const error   = document.getElementById('contact-error')

  label.style.display   = 'none'
  spinner.style.display = 'inline-block'
  btn.disabled = true
  success.style.display = 'none'
  error.style.display   = 'none'

  try {
    await emailjs.send('service_wozppns', 'template_g99cpyy', {
      name:    document.getElementById('contact-name').value.trim(),
      email:   document.getElementById('contact-email').value.trim(),
      subject: document.getElementById('contact-subject').value.trim() || 'Sans sujet',
      message: document.getElementById('contact-message').value.trim()
    })
    success.style.display = 'block'
    e.target.reset()
  } catch (err) {
    console.error('EmailJS error :', err)
    error.style.display = 'block'
  } finally {
    label.style.display   = 'inline'
    spinner.style.display = 'none'
    btn.disabled = false
  }
})
