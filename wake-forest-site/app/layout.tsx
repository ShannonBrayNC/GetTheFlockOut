import {campaign} from './campaign';
import './globals.css';
export const metadata = { icons:{icon:'/favicon.svg'}, metadataBase:new URL('https://'+campaign.hostname), alternates:{canonical:'/'}, openGraph:{title:campaign.brand+' — '+campaign.city,description:'Local privacy petition, evidence and citizen efforts.',images:['/images/camera-and-vehicle.png']}, twitter:{card:'summary_large_image',images:['/images/camera-and-vehicle.png']}, title: 'Wake Forest Deserves Privacy | Community Petition & Evidence', description: 'Wake Forest community petition, citizen records efforts and local Flock accountability. Freeze expansion and demand a public review.' };
export default function Layout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en"><body>{children}</body></html>; }
