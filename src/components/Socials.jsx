import React from 'react'

let Socials = () => {
  const socialItems = [
    {
      icon: 'socials-i_twitter',
      title: 'Twitter',
      url: 'https://twitter.com/'
    },
    {
      icon: 'socials-i_telegram',
      title: 'Telegram',
      url: 'https://t.me/'
    },
    {
      icon: 'socials-i_github',
      title: 'GitHub',
      url: 'https://github.com/'
    }
  ]

  return (
    <div className="socials">
      {socialItems.map((item, index) => (
        <a className={`socials-i ${item.icon}`} key={index} href={item.url}>
          {item.title}
        </a>
      ))}
    </div>
  )
}

export default Socials
