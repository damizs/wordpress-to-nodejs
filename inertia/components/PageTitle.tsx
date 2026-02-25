interface PageTitleProps {
  title: string;
}

export const PageTitle = ({ title }: PageTitleProps) => {
  return (
    <section className="bg-gradient-hero py-6">
      <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground text-center tracking-wide">
        {title}
      </h1>
    </section>
  );
};
