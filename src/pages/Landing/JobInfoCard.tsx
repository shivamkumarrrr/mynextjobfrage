import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { company, jobInfo } from './content';
import { HomeIcon, LocationIcon } from './icons';

export function JobInfoCard() {
  return (
    <Card className="area-jobinfo p-5 text-left shadow-[0_1px_2px_rgba(26,46,56,0.04)]">
      <div className="mb-3.5 flex items-center gap-2 text-sm font-medium text-text">
        <img
          className="h-[26px] w-[26px] rounded-full border border-border bg-card object-contain p-[3px]"
          src={company.logo}
          alt=""
        />
        <span>{company.name}</span>
      </div>
      <div className="mb-2.5 flex flex-wrap gap-2.5">
        <Badge variant="soft">
          <LocationIcon />
          {jobInfo.location}
        </Badge>
        <Badge variant="soft">
          <HomeIcon />
          {jobInfo.remote}
        </Badge>
        <Badge variant="soft">{jobInfo.hours}</Badge>
      </div>
      <p className="mt-3.5 text-sm leading-[1.55] text-muted">{jobInfo.description}</p>
    </Card>
  );
}
