import React from 'react';
import { SOCIALS } from '../../data/staticData';
import type { ProfileData } from '../../types/cms';
import { SocialLinks } from './SocialLinks';

interface PortfolioFooterProps {
  profile: ProfileData;
}

export const PortfolioFooter: React.FC<PortfolioFooterProps> = ({ profile }) => (
  <footer>
    <div className="wrap">
      <div className="who">
        <span>
          <b id="fname">{profile.name}</b>
          <small id="frole">{profile.role}</small>
        </span>
      </div>
      <small id="fcopy">
        © {new Date().getFullYear()} {profile.name}
      </small>
      <SocialLinks items={SOCIALS.footer} />
    </div>
  </footer>
);
