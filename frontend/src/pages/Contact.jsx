import { useForm } from 'react-hook-form';
import { FiClock, FiInstagram, FiMapPin, FiMessageCircle, FiPhone } from 'react-icons/fi';
import { toast } from 'sonner';
import PageIntro from '../components/layout/PageIntro';
import { submitEnquiry } from '../services/api';

const locationUrl = 'https://www.google.com/maps?q=9.5036621,77.8277664';
const whatsappUrl = 'https://wa.me/918524090862?text=Hi%2C%20I%20visited%20your%20website%20and%20I%20would%20like%20to%20enquire%20about%20crackers.';

export default function Contact() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const submit = async (data) => {
    try {
      await submitEnquiry(data);
      toast.success('Your enquiry has been sent');
      reset();
    } catch {
      toast.error('Could not send your enquiry. Please try again.');
    }
  };

  return <main id="main-content">
    <PageIntro eyebrow="We are here to help" title="Let’s talk celebrations." copy="Call, message or visit Natpe Thunai Crackers in Sivakasi. Our team will help you choose the right products and combos." />
    <section className="contact-grid container-wide">
      <div className="contact-stack">
        <div className="contact-panel">
          <p className="eyebrow">Contact details</p>
          <h2>Natpe Thunai Crackers</h2>
          <a className="contact-line" href={locationUrl} target="_blank" rel="noreferrer"><FiMapPin /><span>Virudhunagar to Sivakasi Road<br />Aathupalam, Sivakasi, Tamil Nadu</span></a>
          <a className="contact-line" href="tel:+918524090862"><FiPhone /><span>+91 85240 90862 <small>Owner & WhatsApp</small></span></a>
          <a className="contact-line" href="tel:+918344806268"><FiPhone /><span>+91 83448 06268 <small>Additional contact</small></span></a>
          <a className="contact-line" href={whatsappUrl} target="_blank" rel="noreferrer"><FiMessageCircle /><span>Chat with us on WhatsApp</span></a>
          <a className="contact-line" href="https://www.instagram.com/natpe_thunai_crakers" target="_blank" rel="noreferrer"><FiInstagram /><span>@natpe_thunai_crakers</span></a>
          <p className="contact-line"><FiClock /><span>Open daily: 9:00 AM – 8:00 PM</span></p>
        </div>
        <div className="map-card">
          <iframe title="Natpe Thunai Crackers location in Sivakasi" src="https://www.google.com/maps?q=9.5036621,77.8277664&z=17&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <a href={locationUrl} target="_blank" rel="noreferrer">Open directions <FiMapPin /></a>
        </div>
      </div>
      <form className="customer-form" onSubmit={handleSubmit(submit)}>
        <p className="eyebrow">Quick enquiry</p>
        <h2>Send us a message</h2>
        <p className="form-intro">Tell us what you need. The shop team will contact you directly—there is no online payment.</p>
        {[['name', 'Name'], ['mobile', 'Mobile'], ['email', 'Email'], ['subject', 'Subject']].map(([name, label]) => <label key={name}>{label}<input required={name !== 'email'} {...register(name)} /></label>)}
        <label>Message<textarea required rows="6" {...register('message')} /></label>
        <button disabled={isSubmitting} className="button button--gold">{isSubmitting ? 'Sending…' : 'Send enquiry'}</button>
      </form>
    </section>
  </main>;
}
