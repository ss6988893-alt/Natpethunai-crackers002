import { Link } from 'react-router-dom';
import PageIntro from '../components/layout/PageIntro';
export default function NotFound(){return <main id="main-content"><PageIntro eyebrow="404" title="This spark drifted away." /><div className="container-wide"><Link className="button button--gold" to="/">Back home</Link></div></main>}
