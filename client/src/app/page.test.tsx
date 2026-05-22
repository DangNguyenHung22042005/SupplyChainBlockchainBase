import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home page', () => {
  it('renders main heading', () => {
    render(<Home />)
    expect(
      screen.getByRole('heading', { name: /VeloChain Supply Chain/i }),
    ).toBeInTheDocument()
  })

  it('shows navigation cards', () => {
    render(<Home />)
    expect(screen.getByText(/Register Roles/i)).toBeInTheDocument()
    expect(screen.getByText(/Order Materials/i)).toBeInTheDocument()
    expect(screen.getByText(/Control Chain/i)).toBeInTheDocument()
    expect(screen.getByText(/Track Item/i)).toBeInTheDocument()
  })
})

