import { PageHeader } from '@/components/page-header';
import { AnnouncementForm } from './_components/announcement-form';
import { AnnouncementList } from './_components/announcement-list';

export default function AdminPengumumanPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Kelola Pengumuman"
        description="Buat dan terbitkan pengumuman baru untuk ditampilkan kepada warga."
      />
      <AnnouncementForm />
      <AnnouncementList />
    </div>
  );
}
