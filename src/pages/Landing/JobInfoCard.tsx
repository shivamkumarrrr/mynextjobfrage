import { Badge } from '@/components/ui/badge';
import { jobInfo } from './content';
import { HomeIcon, LocationIcon } from './icons';

/**
 * The job's hard facts as inline chips. They used to sit in a bordered card
 * that repeated the company name and logo already shown in the header, which
 * boxed off the hero's reading flow for no new information.
 */
export function JobInfoCard() {
  return (
    <ul className="flex list-none flex-wrap gap-2.5">
      <li>
        <Badge variant="soft">
          <LocationIcon />
          {jobInfo.location}
        </Badge>
      </li>
      <li>
        <Badge variant="soft">
          <HomeIcon />
          {jobInfo.remote}
        </Badge>
      </li>
      <li>
        <Badge variant="soft">{jobInfo.hours}</Badge>
      </li>
    </ul>
  );
}
